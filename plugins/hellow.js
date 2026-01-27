import { cleanJid, definePlugins } from "zaileys";

export default definePlugins(
  async (wa, ctx) => {
    const roomId = ctx.messages?.roomId;
    console.log("Room ID:", roomId);
    
    const waClient = global.waClient;
    
    if (waClient && typeof waClient.button === 'function') {
      await waClient.button(roomId, {
        text: 'Interactive menu:',
        buttons: {
          type: 'interactive',
          footer: 'Footer text',
          data: [
            { type: 'quick_reply', id: 'reply1', text: 'Quick Reply' },
            { type: 'cta_url', text: 'Visit Website', url: 'https://example.com' },
            { type: 'cta_copy', id: 'copy1', text: 'Copy Code', copy: 'PROMO123' },
            { type: 'cta_call', text: 'Call Us', phoneNumber: '+917605902011' },
          ],
        },
      });
    } else {
      console.error('Client instance not available');
    }
  },
  {
    matcher: ['/hello', '!hello'], 
    metadata: {
      description: 'A simple hello world plugin',
    },
  },
)