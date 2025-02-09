require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const path = require('path');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);
});

// Download Video command configuration
bot.onText(/\/dv (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const url = match[1];

  if (isValidUrl(url)) {
    bot.sendMessage(chatId, 'Processing video...');
    try {
      const videoPath = await downloadVideo(url);
      bot.sendMessage(chatId, 'Download complete!');
    } catch (error) {
      bot.sendMessage(chatId, "I can't download the video, are you sure it's a valid YouTube URL?");
    }
  } else {
    bot.sendMessage(chatId, 'The URL is not valid.');
  }
});

// Download Audio command configuration
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

// Helper function to download video using yt-dlp
async function downloadVideo(url) {
  return new Promise((resolve, reject) => {
    const videoOutputPath = `downloads/${Date.now()}.mp4`;
    const command = `yt-dlp -f "136+140" -o "${videoOutputPath}" ${url}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error running yt-dlp: ${stderr || error.message}`);
        return;
      }
      console.log(stdout);
      resolve(videoOutputPath);
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
