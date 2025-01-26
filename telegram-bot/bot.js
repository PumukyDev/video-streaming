require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');

  // Download Video command configuration
  bot.onText(/\/dv (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1];
  
    if (isValidUrl(url)) {
      bot.sendMessage(chatId, 'Processing video');
    } else {
      bot.sendMessage(chatId, 'The URL is not valid.');
    }
  });


  const path = require('path');

  // Matches "/da [url]"
  bot.onText(/\/da (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1];

    if (isValidUrl(url)) {
      bot.sendMessage(chatId, 'Processing your audio...');

      try {
        const audioPath = await downloadAudio(url);
        bot.sendMessage(chatId, 'Download complete!');
      } catch (error) {
        bot.sendMessage(chatId, "I can't download it, are you sure it's a valid youtube URL?");
      }
    } else {
      bot.sendMessage(chatId, 'This is not a URL');
    }
  });

  const { exec } = require('child_process');

  // Helper function to download audio using yt-dlp
  async function downloadAudio(url) {
    return new Promise((resolve, reject) => {
      const audioOutputPath = `downloads/${Date.now()}.mp3`;
      const command = `yt-dlp -x --audio-format mp3 -o "${audioOutputPath}" ${url}`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(`Error running yt-dlp: ${stderr || error.message}`);
          return;
        }
        console.log(stdout);
        resolve(audioOutputPath);
      });
    });
  }
  

  // Helper function to validate URLs
  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  }

});