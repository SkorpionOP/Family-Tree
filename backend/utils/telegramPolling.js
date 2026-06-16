const User = require('../models/User');

let lastUpdateId = 0;

async function startTelegramPolling(token) {
  console.log('Starting Telegram bot in Long Polling mode...');
  
  try {
    // Delete any active webhook first (required to enable getUpdates)
    const delRes = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
    const delData = await delRes.json();
    if (delData.ok) {
      console.log('Telegram webhook cleared for polling.');
    }
  } catch (err) {
    console.error('Error clearing Telegram webhook:', err);
  }

  const poll = async () => {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`);
      if (!res.ok) {
        setTimeout(poll, 5000);
        return;
      }

      const data = await res.json();
      if (data.ok && data.result.length > 0) {
        const { handleTelegramWebhook } = require('../controllers/authController');
        
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          
          // Mimic express req/res
          const req = { body: update };
          const resMock = { sendStatus: () => {} };
          
          try {
            await handleTelegramWebhook(req, resMock);
          } catch (err) {
            console.error('Error handling polled update:', err);
          }
        }
      }
      
      setTimeout(poll, 200);
    } catch (err) {
      console.error('Telegram polling error:', err);
      setTimeout(poll, 5000);
    }
  };

  poll();
}

module.exports = { startTelegramPolling };
