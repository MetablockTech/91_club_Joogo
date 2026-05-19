import connection from './src/config/connectDB.js';

const app_id = '420579';
const app_secret = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCkIMkBs4dpqNaH
rkdM7ddm4EMFUTRNoZkQbzArVid3IPOHPfU1j5lrM/Gkmi0bRZRh40ox6WMUB1Z6
YNiQ7yPwA5SQ2KwBfj52K13dkliOhUSca8Tc0+JUh1QG4oNYGhWpKELY//uNWhm0
bsw7rG5coXYm3uXQkOOdRr/ZVzZXjQSS+vIlBy6oPjMY6hgy2ibU6mTADG3F9qJv
btoHyI5Gd2DPgOeB8fGaTpI4AgbgM0pFEDcX8u5Cnkc1XTFwImBhdsYQnsVnLW9U
ECtKSkesLpnJVv+D3/l/o/VQNVRNP5zFmSB+mo+2G+BoWxs2P1gwYK48tmin2NLX
g4+ScObDAgMBAAECggEACe9OG4NBfBzTN41OFZMECd8jT2wV7WkNudfxI35ojyZ4
d0RB1oclsz6Grv8CIfd5Pt+iOxk0fR7gljHMiiFfnISq9oWXC9QXddG0MdhM8fuR
JqLDXNaaiaFTbcNCTg/uJbohKb98+5ZrnedjB22tlH/Vhg7R/Gj4zildLYvA51Wy
Antcv0D+EZywfB7MrU7k1VohP+HRyjj9ghcxpt1g6Ae9YYB6/oQKSAULeqcdN7v3
ZzP0NOMJ0T6OGenYRiJ+Lq4THC+hi2Tt6dsrbEmnrB9p6zCxFzk4wDJFtEGCo3Zp
q3QYYkHajM7BYpmSuBcRKKNUSJu48PuB8VOUbX0gWQKBgQDcf93YRscpHOEgMO0c
Hxo8gRgEiIuBKcDXIGu+hhl2j34ynPaPn4LXvFMCkzZM94+KRAMWAGOgW0sLBr0j
aFM6AbBfmQNmIn8fa6KhP2y9WX+6Jufafm0nflZpqJ02nQtparFUTY7KGYqk44qy
0eH/AYoIa3KwHlo26po2XMgDjQKBgQC+jYHzTXTJ0BsuFizQ9mpFj3O7h4TySUzZ
gCP4lzxeanX1psWuW7AprHcbw1iLU35P9waVxuDkcH85T/3v9bDMmTE3BOKRmhdZ
3BjKSYV0yJQGgjFu+xppoRVopN64od/ZJb71iLrs3n/s5Tpp9mpNppQ/uzGuS6TA
p7L2qgpXjwKBgBKC8Z78oi/DausG8IER42P8+oU26W9YkAX/hMwj+fNILLIXF2QL
YjK2bsmijkZ76iMTfqbUNYj64Rv13t8gHQybo7EC6ZQjhUSgBrE+3+QtpVl9dq2T
O5q7MooAS+KP4Kti96w6Lqis6ETbjYNht3VvLaVzT9eVVMGThIrX0zrpAoGACRtC
JpqBBlQHuIAezC26jnB4m3GyjNGr9okFLxArNmfoE0FRGTAQjy1K0+zWAnKPCstH
aUkD3mbx7Y9BF4KqXFzF2VdGbKbsjsLR/HjfA+HCET2Plzow3PNxznpymmhCBmKj
aaCLLl7DxlJ+JCo+kk9vrkwH58h9qydYiik+LUkCgYA24B+/ku5sPbKwHjv4G5kZ
Zx+UqvaiTG1rVpYcQn7WmDDeqODAr9EWzHRcmeEEfieQKLXZetTv7efsqqxMYSak
fdzXfzgF/yVrJrMu0nypyaYmru090N/j+JbbGNktqNptCR16AMmKpvw+mMD1CVCP
qSPwXokmoMEaEuLNsjeMjw==
-----END PRIVATE KEY-----`;

const public_key = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmH/MIv3dlW8jcZLmjpxch51QGv1x7tv8xjgc4e1zBpKJI0YGuR8awDKJEbrPp0K6XMdZY1c/zkDwugTMWj/2v7zpYOd59d6LAsKQdYLhYFy+LYjrA9j8LYuQkpoP6AFn2JQ1tx90D0PqsfNPC6dxb2Iag8iZhoGC2hPJ1zVM6EKde4Wy8+s9pO0fqXTlTP2+1pSEXTrmU03+//OJub7UoNwo00HL21RsJAJUt+8lOgUyvyYTEALk5rBzCnV97F6DcLRAHzkyVmemvKh42sEua9jN+alLkfpKNgPoFKPcl4yTYjPk6htLik9dNe/K9LE4fToS5ktnWaqIIzb936gzQQIDAQAB
-----END PUBLIC KEY-----`;

const base_url = 'https://api.payok.com';

async function run() {
  try {
    const [rows] = await connection.query("SELECT * FROM payment_configs WHERE gateway_name = 'payok'");
    if (rows.length > 0) {
      await connection.query("UPDATE payment_configs SET merchant_id = ?, private_key = ?, public_key = ?, status = 1 WHERE gateway_name = 'payok'", [app_id, app_secret, public_key]);
      console.log('PAYOK Config updated');
    } else {
      await connection.query("INSERT INTO payment_configs (gateway_name, merchant_id, private_key, public_key, min_recharge, max_recharge, status) VALUES (?, ?, ?, ?, ?, ?, ?)", ['payok', app_id, app_secret, public_key, 100, 50000, 1]);
      console.log('PAYOK Config inserted');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
