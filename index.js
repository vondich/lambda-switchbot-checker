const AWS = require("aws-sdk");
const switchbot = require('./switchbot');
const triggerWebhook = require('./triggerWebhook');

const autoOffThresholdInSeconds = process.env.AUTO_OFF_THRESHOLD_IN_HOURS * 3600;
let lastOnTimestamp = null;
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async function(event) {
  try {
    const status = await switchbot.getStatus();
    console.debug(status);
    if (status === 'on') {
      const botLastOnTimestamp = await dynamo
          .get({
            TableName: "home_automation",
            Key: {
              key: 'botLastOnTimestamp',
            }
          })
          .promise();
      lastOnTimestamp = botLastOnTimestamp?.value;
      console.debug(`lastOnTimestamp: ${lastOnTimestamp}`);
      
      if (!lastOnTimestamp) {
        lastOnTimestamp = Math.floor(new Date().getTime() / 1000);
        await dynamo
          .put({
            TableName: "home_automation",
            Item: {
              key: 'heaterLastOnTimestamp',
              value: lastOnTimestamp
            }
          })
          .promise();
      }
      console.debug('lastOnTimestamp', lastOnTimestamp);
      const currentTime = Math.floor(new Date().getTime() / 1000);
      console.debug('currentTime', currentTime);

      // auto-off device if it's still turned off after the threshold
      if ((currentTime - lastOnTimestamp) >= autoOffThresholdInSeconds) {
        console.log('Turning off device');
        await switchbot.setStatus(false);
        await triggerWebhook({ text: 'Heater turned off'});
      // if it's turned on but within the threshold, just call the webhook
      } else {
        await triggerWebhook({ text: 'Heater is on'});
        console.log('Webhook triggered');
      }
    // reset status tracking if it's turned off
    } else {
      await dynamo
        .put({
          TableName: "home_automation",
          Item: {
            key: 'heaterLastOnTimestamp',
            value: null
          }
        })
        .promise();
    }
  } catch(err) {
    console.error(err);
  };
}