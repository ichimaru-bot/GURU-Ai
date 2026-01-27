import { definePlugins } from 'zaileys';
import helper from '../lib/helper.js';

export default definePlugins(
  async (wa, ctx) => {
    const waClient = global.waClient;
    const { roomId, chatType, media, replied } = ctx.messages;

    let mediaBuffer = null;
    
    if (chatType === 'sticker' && media) {
      try {
        mediaBuffer = await media.buffer();
      } catch (error) {
        console.error('Error getting sticker buffer:', error);
      }
    }

    if (!mediaBuffer && replied) {
      const repliedChatType = replied.chatType;
      const repliedMedia = replied.media;
      
      if (repliedChatType === 'sticker' && repliedMedia) {
        try {
          mediaBuffer = await repliedMedia.buffer();
        } catch (error) {
          console.error('Error getting replied sticker buffer:', error);
        }
      }
    }

    if (!mediaBuffer) {
      return await waClient.send(roomId, '🖼️reply to a sticker!');
    }

    try {
      let imageBuffer = null;
      
      try {
        const jpegBuffer = await helper.convertToJpg(mediaBuffer);
        const telegraphUrl = await helper.uploadToTelegraph(jpegBuffer);
        await waClient.send(roomId, {
          image: telegraphUrl,
          caption: '✅ Sticker converted and uploaded!',
        });
        return;
      } catch (telegraphError) {
        console.warn('Telegraph upload failed:', telegraphError.message);
      }

      try {
        imageBuffer = await helper.convertToJpg(mediaBuffer);
        
        await waClient.send(roomId, {
          image: imageBuffer,
          caption: '✅ Sticker converted to image!',
        });
        return;
      } catch (sharpError) {
        console.warn('Sharp conversion failed:', sharpError.message);
      }

      // Final fallback: Send webp as-is
      await waClient.send(roomId, {
        image: mediaBuffer,
        caption: '✅ Sticker sent (WebP format)',
      });
    } catch (error) {
      console.error('Convert to image error:', error);
      await waClient.send(roomId, `❌ Error converting sticker: ${error.message}`);
    }
  },
  {
    matcher: ['.toimg', '.toimage', '/toimg'],
    metadata: {
      description: 'Convert stickers to image',
    },
  },
);
