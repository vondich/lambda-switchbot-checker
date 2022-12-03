const https = require('https');

module.exports = (payload) => {
  console.log(`triggerWebhook`);
  const body = JSON.stringify(payload);
  const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
    },
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(process.env.WEBHOOK_URL, options, res => {
      console.log(`statusCode: ${res.statusCode}`);
      res.on('data', d => {
        console.log(d.toString());
        resolve(true);
      });
    });

    req.on('error', error => {
        reject(error);
    });

    req.write(body);
    req.end();
  });
}