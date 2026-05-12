#!/bin/bash

# Exit if any command fails
set -e

echo "Updating system..."
sudo apt update -y
sudo apt upgrade -y

echo "Installing NVM and Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install --lts

echo "Installing PM2 globally..."
npm install pm2 -g

echo "Installing Nginx..."
sudo apt install nginx -y

echo "Installing Certbot for SSL..."
sudo add-apt-repository ppa:certbot/certbot -y
sudo apt-get update -y
sudo apt-get install python3-certbot-nginx -y

echo "Installing PHP and MySQL..."
sudo apt install php8.1-mysql mysql-client-core-8.0 mysql-server -y

echo "Setting up MySQL user and database..."
sudo mysql <<EOF
CREATE USER IF NOT EXISTS 'harsh'@'localhost' IDENTIFIED BY 'Harsh@123';
GRANT ALL PRIVILEGES ON *.* TO 'harsh'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
CREATE DATABASE IF NOT EXISTS 91club;
EOF

echo "Importing database from SQL file..."
if [ -f /home/91club.sql ]; then
    sudo mysql 91club < /home/91club.sql
else
    echo "/home/91club.sql not found, skipping import."
fi

echo "Cloning backend repository..."
cd /home
rm -rf rkwin_starworldz.club  # In case it already exists
git clone https://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@github.com/MetablockTech/rkwin_starworldz.club.git

echo "Installing backend dependencies and starting with PM2..."
cd rkwin_starworldz.club
npm install
pm2 start --name "backend" npm -- start
pm2 save

echo "Setting up Nginx config..."
NGINX_CONF="/etc/nginx/sites-available/91club"
sudo tee "$NGINX_CONF" > /dev/null <<EOL
server {
    server_name starworldz.com;

    location / {
        proxy_pass http://127.0.0.1:9010;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL

echo "Enabling Nginx site..."
sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/91club
sudo nginx -t && sudo systemctl restart nginx

echo "Requesting SSL certificate from Let's Encrypt..."
sudo certbot --non-interactive --nginx --agree-tos -d starworldz.com -m rahdanish785@gmail.com

echo "Reloading Nginx with SSL..."
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Setup completed successfully!"
