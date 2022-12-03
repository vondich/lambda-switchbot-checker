const crypto = require('crypto');
const https = require('https');

module.exports = () => {
  const token = process.env.SWITCHBOT_API_TOKEN;
  const secret = process.env.SWITCHBOT_API_KEY;
  const deviceId = process.env.SWITCHBOT_DEVICE_ID;

  const t = Date.now();
  const nonce = "requestID";
  const data = token + t + nonce;
  const signTerm = crypto.createHmac('sha256', secret)
      .update(Buffer.from(data, 'utf-8'))
      .digest();
  const sign = signTerm.toString("base64");

  const options = {
    hostname: 'api.switch-bot.com',
    port: 443,
    path: `/v1.1/devices/${deviceId}/status`,
    method: 'GET',
    headers: {
        "Authorization": token,
        "sign": sign,
        "nonce": nonce,
        "t": t,
    },
  };


  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);
      res.on('data', d => {
        const resData = JSON.parse(d);
        console.log(resData);
        const state = resData.body.power;
        resolve(state);
      });
    });

    req.on('error', error => {
        reject(error);
    });

    req.end();
  });
}