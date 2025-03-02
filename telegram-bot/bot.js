require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the Telegram Bot token from the .env file
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
      const hlsUrl = await downloadVideo(url);
      bot.sendMessage(chatId, `Download and conversion complete! Watch the video at:\n ${hlsUrl}`);
    } catch (error) {
      bot.sendMessage(chatId, "I can't process the video. Are you sure it's a valid YouTube URL?");
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
      bot.sendMessage(chatId, "I can't download it, are you sure it's a valid YouTube URL?");
    }
  } else {
    bot.sendMessage(chatId, 'This is not a URL');
  }
});

// Helper function to download audio using yt-dlp
async function downloadAudio(url) {
  return new Promise((resolve, reject) => {
    const fileDate = `${Date.now()}`;
    const audioOutputPath = `downloads/${fileDate}.mp3`;
    const oggOutputPath = `downloads/${fileDate}.ogg`;

    // Download the audio in mp3
    const downloadCommand = `yt-dlp -x --audio-format mp3 -o "${audioOutputPath}" ${url}`;

    exec(downloadCommand, (error, stdout, stderr) => {
      if (error) {
        reject(`Error running yt-dlp: ${stderr || error.message}`);
        return;
      }

      console.log(stdout);

      // Convert mp3 file to ogg
      const conversionCommand = `ffmpeg -i "${audioOutputPath}" -acodec libvorbis "${oggOutputPath}"`;

      exec(conversionCommand, (convertError, convertStdout, convertStderr) => {
        if (convertError) {
          reject(`Error converting to ogg: ${convertStderr || convertError.message}`);
          return;
        }

        console.log('Conversion successful:', convertStdout);

        fs.appendFile('downloads/lista.txt', `/home/alumno/canciones/${fileDate}.ogg\n`, (err) => {
          if (err) {
            console.error('Error updating lista.txt:', err);
          } else {
            console.log('lista.txt updated with new audio:', oggOutputPath);
          }
        });

        resolve(oggOutputPath);
      });
    });
  });
}



// Helper function to download video using yt-dlp and convert to HLS
async function downloadVideo(url) {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const videoOutputPath = `downloads/${timestamp}.mp4`;
    const hlsOutputDir = `downloads/hls_${timestamp}`;
    const hlsFile = `output.m3u8`;
    const hlsUrl = `http://127.0.0.1/hls/hls_${timestamp}/${hlsFile}`;

    // Command to download the video
    const downloadCommand = `yt-dlp -f "136+140" -o "${videoOutputPath}" ${url}`;

    exec(downloadCommand, (error, stdout, stderr) => {
      if (error) {
        reject(`Error running yt-dlp: ${stderr || error.message}`);
        return;
      }
      console.log('Video downloaded:', stdout);

      // Create HLS directory
      exec(`mkdir -p ${hlsOutputDir}`, (mkdirError) => {
        if (mkdirError) {
          reject(`Error creating HLS directory: ${mkdirError.message}`);
          return;
        }

        // Command to convert the video to HLS
        const hlsCommand = `ffmpeg -i "${videoOutputPath}" -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -hls_segment_filename "${hlsOutputDir}/segment_%03d.ts" -f hls "${hlsOutputDir}/${hlsFile}"`;

        exec(hlsCommand, (ffmpegError, ffmpegStdout, ffmpegStderr) => {
          if (ffmpegError) {
            reject(`Error running ffmpeg: ${ffmpegStderr || ffmpegError.message}`);
            return;
          }
          console.log('Video converted to HLS:', ffmpegStdout);
          resolve(hlsUrl);
        });
      });
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
