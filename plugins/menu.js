import { definePlugins } from 'zaileys';

export default definePlugins(
  async (wa, ctx) => {
    const waClient = global.waClient;
    const { roomId, senderName, senderId, message } = ctx.messages;

    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    let greeting = '🌅 Good Morning';
    const hour = now.getHours();
    if (hour >= 12 && hour < 17) {
      greeting = '☀️ Good Afternoon';
    } else if (hour >= 17 && hour < 21) {
      greeting = '🌆 Good Evening';
    } else if (hour >= 21 || hour < 5) {
      greeting = '🌙 Good Night';
    }

    const quotes = [
      '🎯 Success is not final, failure is not fatal.',
      '💪 Your only limit is you.',
      '🚀 Dream big, work hard, stay focused.',
      '✨ Be the change you want to see.',
      '🔥 Every expert was once a beginner.',
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    const botName = global.botname || 'GURU-Ai';
    const author = global.author || 'Guru322';
    const platform = 'linux';
    const prefix = '.';

    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    const uptimeSeconds = Math.floor(uptime % 60);
    const uptimeStr = `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`;

    const menuText = `╭━━━⊰ *${botName}* ⊱━━━╮
┃
┃ 👋 Hello, ${senderName}!
┃ ${greeting}
┃
┃ 📜 *${quote}*
┃
╰━━━━━━━━━━━━━━━╯

╭━━━⊰ *TODAY* ⊱━━━╮
┃ 📅 *Date:* ${date}
┃ ⏰ *Time:* ${time}
╰━━━━━━━━━━━━━━━╯

╭━━━⊰ *BOT INFO* ⊱━━━╮
┃ 🤖 *Bot Name:* ${botName}
┃ 👑 *Owner:* ${author}
┃ 🖥️ *Platform:* ${platform}
┃ ⌨️ *Prefix:* ${prefix}
┃ ⏱️ *Uptime:* ${uptimeStr}
╰━━━━━━━━━━━━━━━╯

Type *.list* to see all commands
`;

    try {
      await waClient.send(roomId, {
        image: 'https://cdn.jsdelivr.net/gh/Guru322/api@Guru/K.jpg',
        caption: menuText,
      });
      
      await waClient.button(roomId, {
        text: '🎮 Menu Options',
        buttons: {
          type: 'interactive',
          footer: '© GURU-Ai | 2025',
          data: [
            {
              type: 'quick_reply',
              id: '.list',
              text: '🔍 Commands',
            },
            {
              type: 'quick_reply',
              id: '.ping',
              text: '⚡ Ping',
            },
          ],
        },
      });
    } catch (error) {
      console.error('Send failed:', error.message);
      
      await waClient.send(roomId, {
        text: menuText,
        replied: message(),
      });
    }

    try {
      await waClient.reaction(message(), '🤖');
    } catch (error) {
      console.warn('Reaction failed:', error.message);
    }
  },
  {
    matcher: ['.menu', '.help', '/menu', '!menu'],
    metadata: {
      description: 'Show bot menu with commands and info',
    },
  },
);
