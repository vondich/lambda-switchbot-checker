const getBotStatus = require('./getBotStatus');
const triggerWebhook = require('./triggerWebhook');

exports.handler = async function(event) {
  try {
    const status = await getBotStatus();
    console.debug(status);
    if (status === 'on') {
      await triggerWebhook();
      console.log('Webhook triggered');
    }
  } catch(err) {
    console.error(err);
  };
}