import connection from './src/config/connectDB.js';

const app_id = '910067';
const app_secret = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCrVStQPSr7F4CI
IINOUdaXS/qOeYVvC/0gGjweCHTjnWn16QTa6AYilk2UPBayCawMkZd664buW6xV
33rh+1qnMhRHp+bDGuHkb8YY8EeSSLrxFVWHn0MIAN/q4yytQxatxo3v2+upjNQ
WrC1HPci1nx8+wb/j1MsXQ4BpYxXwO7GTmJ5MeQ5omi/JUFQuowvFYlEcglkhiGt
Lb0aDy82UF7v2hC3CCMEOiG3FYOlE88V6u++aXJzbSLP6KaYh9RxL28epDDnWA8e
10dL56AuaYfRUCRjFLab3DjNcIzxyi6k6raU/py/b8EfGEyPYz9xCoe3hdjqgZ8q
jQzhM3IWfAgMBAAECggEAMjXFecBTRj5+9mXA1UT6hGBJz1MhnYd/6NaHY63Kw6G
wGdbuC1EP6zbtCVIKvKZE+3H3WJiJdHT9LjVOB8fnqzPr6Yv0/px0MsPm5AwWjXI
vBtPfut0bgc7v0CA/SY9tqAOWOQLUL14MEZDnvAcJOOCnAXc6SwRjeC/aBAh7t2j
sAXC1g+F7+otagGJ4vRzOxLIfa9pY8mFpCWwnJ/+h2+2605b3BpeUDCl6+Rzv+uL
/4b9mmrczpE+yi/pKf40yqsltfrwSG/i8t6KrgsNJAmIyfZ6cFpwsKlchCyDviXB
K5YryGub7skwYW9n3Y0ss0Xb+Kkl/u/HHaMlMaDgSUQKBgQDfaUPK+1JDzeIutp6
12upeDrh79guaaFblFNqF3Wu0tB9g5T2qlKHCqzzuzslHXtrdODqsemvzihG2JYA
BdO2O1udaamidJ/oPAMaDQuxEx7IBGfY/GF2wuqz6Q21m8sPG6/39TMFPRfj8s7t
G5jka+IdryT+j6cMugS4YzVyQTQKBgQDEUymSqaTVewfpdQzUDJOLi04Zh3oDaYi
ZISiXim1LgUIwcyrprz880z1TQyf/2FruAg38o3mS53F+wTdz/ldrA7V7jtwdz++
j9kkJbJ9vaiuo5+XhrtW8g4N8uaxw/gKib6okeNCfY5x1pU5o1XGeVPS8/hDd7N9
fnHYkusFDmwKBgCAOvseVoIxSMq55TfTSYOb2Pcqr16ZkanOctm6XAyl+3zHMMzk
S8tM4NxodWgx/s/AibWjqeCsOGNSGNQ0KujvQ4om60yAZ6GvWtKWJKNYFwakezJL
pMCh34PJYUo5/L1CP9HYwWVzCsaOxNqJJzs/r8aKp0hP3Kya1KqQsc6fRAoGBAML
w3N/vqWf9MV8ERgessTknyxYYavRGb0e2ICtRXbNSlxmq0dqWlBFeo48wqOAnwiq
BScgpvwc633yAeQKpc74kQal9sl274nWJkP5VqH6mCtI96grNYxg78mz/pRXRc2Y
9wNFUUbti2rIKwa/g+V/Bdf7PvInQsgCrSLix5EOvAoGAM7S2XRPQFMr0NMzyLiE
o8kofGvcyhmwYEoy3JSkZdGmBbHVMa+UVhq2oTrGnf36EoPIQ1D+PwWVmzuMNkY
pxYoUTWRL5RVFrBieCaLqGl5rFQ2TTocPVNSH1jY3eQ1rzG7dZx9PbhdQPLQMs5
m8/EDjfq8QUrmjmBzmUVEv4XQ8=
-----END PRIVATE KEY-----`;

const public_key = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwo5RuvvkhywS8tEMqZgO
Z9V40i7T7QBgb2kk5g3KKG5U+wy2CLiLmFIcO/vBMwm0YObwMQdAe34LbBenlMsB
KEQV9mrJN7i60Vy4ZSDo0+heJeDLNg3v2ODYnFASRWA6mU88k71mFRpcJy1Stiu
27PczTtTXZxl16CPlJxvIjuCvSOmC9Kpayc3yLPJ/44hB6+pBbXgHhAiyEOThkac
v6mNJBbiCqyx7kVF13qSUtH94VngcourB9KF948joCF52PGcH7VuGjRWJCIIIe7J
SH75By657R817yV85T2ynNysE991HfzGgWwM9WSqP1nS1KuKsY64Q750oKL7squy
UiQIDAQAB
-----END PUBLIC KEY-----`;

const base_url = 'https://api.payok.com';

async function run() {
  try {
    const [rows] = await connection.query("SELECT * FROM payment_configs WHERE gateway_name = 'payok'");
    if (rows.length > 0) {
      await connection.query("UPDATE payment_configs SET merchant_id = ?, private_key = ?, public_key = ?, status = 1, callback_url = ?, return_url = ? WHERE gateway_name = 'payok'", [app_id, app_secret, public_key, 'https://joogo63.com/api/webapi/recharge/payok/callback', 'https://joogo63.com/wallet/rechargerecord']);
      console.log('PAYOK Config updated');
    } else {
      await connection.query("INSERT INTO payment_configs (gateway_name, merchant_id, private_key, public_key, min_recharge, max_recharge, status, callback_url, return_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", ['payok', app_id, app_secret, public_key, 100, 50000, 1, 'https://joogo63.com/api/webapi/recharge/payok/callback', 'https://joogo63.com/wallet/rechargerecord']);
      console.log('PAYOK Config inserted');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
