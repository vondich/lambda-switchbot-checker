const https = require('https');

module.exports = () => {
  const options = new URL(process.env.WEBHOOK_URL);
  console.log(`triggerWebhook`);
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      console.log(`webhook statusCode: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', error => {
      console.error(error);
      reject(error);
    });

    req.end();
  });
}