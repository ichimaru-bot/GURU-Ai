import { definePlugins } from 'zaileys';

export default definePlugins(
  async (wa, ctx) => {
    const waClient = global.waClient;
    const { roomId, text, chatType, media, replied } = ctx.messages;

    let mediaBuffer = null;
    
    if ((chatType === 'image' || chatType === 'video') && media) {
      try {
        mediaBuffer = await media.buffer();
      } catch (error) {
        console.error('Error getting media buffer:', error);
      }
    }

    if (!mediaBuffer && replied) {
      const repliedChatType = replied.chatType;
      const repliedMedia = replied.media;
      
      if ((repliedChatType === 'image' || repliedChatType === 'video') && repliedMedia) {
        try {
          mediaBuffer = await repliedMedia.buffer();
        } catch (error) {
          console.error('Error getting replied media buffer:', error);
        }
      }
    }

    if (!mediaBuffer) {
      return await waClient.send(roomId, '📸 Please send an image/video with the command or reply to an image/video!');
    }

    try {
      await waClient.send(roomId, {
        sticker: mediaBuffer,
      });

      await waClient.send(roomId, '✅ Sticker created successfully!');
    } catch (error) {
      console.error('Sticker error:', error);
      await waClient.send(roomId, `❌ Error creating sticker: ${error.message}`);
    }
  },
  {
    matcher: ['.sticker', '.s', '/sticker'],
    metadata: {
      description: 'Convert images/videos to stickers',
    },
  },
);
