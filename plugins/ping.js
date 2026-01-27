import { definePlugins } from 'zaileys';

export default definePlugins(
  async (wa, ctx) => {
    const waClient = global.waClient;
    const socket = waClient.socket;
    const { roomId, senderId, senderName, message } = ctx.messages;

    const start = Date.now();

    const pingMsg = await waClient.send(roomId, {
      text: '⏳ Pinging...',
      replied: message(),
    });
    const ping = Date.now() - start;
    const botUserId = socket?.user?.id?.split('@')[0] || 'bot';
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:GURU-Ai Bot
N:Bot;GURU;;;
ORG:WhatsApp Bot
TEL;type=CELL;type=VOICE;waid=${botUserId}:${botUserId}
END:VCARD`;

    const fakeReplyWithVcard = {
      ...pingMsg,
      message: {
        contactMessage: {
          displayName: 'GURU-Ai',
          vcard: vcard,
        },
      },
    };

    try {
      await waClient.edit(pingMsg, {
        text: `🏓 *PONG!*

📊 Ping: *${ping}ms*
⚡ Status: Online
🤖 Bot: GURU-Ai
👤 User: ${senderName}`,
        replied: fakeReplyWithVcard,
      });
    } catch (error) {
      await waClient.send(roomId, {
        text: `🏓 *PONG!*

📊 Ping: *${ping}ms*
⚡ Status: Online
🤖 Bot: GURU-Ai
👤 User: ${senderName}
`,
        replied: message(),
      });
    }
  },
  {
    matcher: ['.ping', '.pong', '/ping'],
    metadata: {
      description: 'Check bot ping and response time',
    },
  },
);
