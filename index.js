const switchbot = require('./switchbot');
const triggerWebhook = require('./triggerWebhook');

let lastOnTimestamp = null;
const autoOffThresholdInSeconds = process.env.AUTO_OFF_THRESHOLD_IN_HOURS * 3600;

exports.handler = async function(event) {
  try {
    const status = await switchbot.getStatus();
    console.debug(status);
    if (status === 'on') {
      if (!lastOnTimestamp) {
        lastOnTimestamp = Math.floor(new Date().getTime() / 1000);
      }
      console.debug('lastOnTimestamp', lastOnTimestamp);
      const currentTime = Math.floor(new Date().getTime() / 1000);
      console.debug('currentTime', currentTime);

      // auto-off device if it's still turned off after the threshold
      if ((currentTime - lastOnTimestamp) >= autoOffThresholdInSeconds) {
        console.log('Turning off device');
        await switchbot.setStatus(false);
      // if it's turned on but within the threshold, just call the webhook
      } else {
        await triggerWebhook();
        console.log('Webhook triggered');
      }
    // reset status tracking if it's turned off
    } else {
      lastOnTimestamp = null;
    }
  } catch(err) {
    console.error(err);
  };
}