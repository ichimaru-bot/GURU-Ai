import { definePlugins } from 'zaileys';

export default definePlugins(
  async (wa, ctx) => {
    const waClient = global.waClient;
    const { roomId, text, isGroup, message, senderId, senderLid } = ctx.messages;

    if (!isGroup) {
      await waClient.send(roomId, {
        text: '❌ This command only works in groups',
        replied: message(),
      });
      return;
    }

    try {
      const groupMetadata = await wa.group.metadata(roomId);
      
      const botUser = wa.socket.user || wa.socket.authState?.creds?.me;
      if (!botUser || !botUser.id) {
        await waClient.send(roomId, {
          text: '❌ Error: Cannot get bot information',
          replied: message(),
        });
        return;
      }
      
      const normalizeJid = (jid) => {
        if (!jid) return '';
        return jid.split(':')[0].split('@')[0];
      };
      
      const botPhoneNumber = normalizeJid(botUser.id);
      const botLid = botUser.lid ? normalizeJid(botUser.lid) : null;
      
      const senderNumber = normalizeJid(senderLid || senderId);
      
      const admins = groupMetadata.participants
        .filter((p) => p.admin)
        .map((p) => normalizeJid(p.id));
      
      const allParticipants = groupMetadata.participants.map((p) => ({
        id: p.id,
        normalized: normalizeJid(p.id),
        admin: p.admin,
      }));
      
      const botInGroup = allParticipants.find(
        (p) => p.normalized === botPhoneNumber || p.normalized === botLid,
      );
      
      console.log(`[Group Settings] Bot Phone: ${botPhoneNumber}, Bot LID: ${botLid}, Sender: ${senderNumber}`);
      console.log(`[Group Settings] All Admins (normalized): ${admins.join(', ')}`);
      console.log(`[Group Settings] Bot in group:`, botInGroup);
      
      const isSenderAdmin = admins.includes(senderNumber);
      if (!isSenderAdmin) {
        await waClient.send(roomId, {
          text: '⛔ Only group admins can use this command',
          replied: message(),
        });
        return;
      }

      const isBotAdmin = admins.includes(botPhoneNumber) || (botLid && admins.includes(botLid));
      if (!isBotAdmin) {
        await waClient.send(roomId, {
          text: `⛔ I need to be a group admin to change settings\n\n🔍 :\nBot Phone: ${botPhoneNumber}\nBot LID: ${botLid}\nAdmins: ${admins.join(', ')}\nBot in group: ${botInGroup ? 'Yes' : 'No'}`,
          replied: message(),
        });
        return;
      }

      const action = text.split(' ')[1]?.toLowerCase() || '';
      
      const settingMap = {
        open: 'not_announcement',
        close: 'announcement',
      };

      if (action && settingMap[action]) {
        const setting = settingMap[action];
        await wa.socket.groupSettingUpdate(roomId, setting);

        const status = action === 'close' ? '🔒 Closed' : '🔓 Open';
        const description = action === 'close'
          ? 'Only admins can send messages'
          : 'Everyone can send messages';

        await waClient.send(roomId, {
          text: `${status}
${description}`,
          replied: message(),
        });

        await waClient.reaction(message(), '✅');
      } else {
        await waClient.button(roomId, {
          text: '📋 Choose group setting:',
          buttons: {
            type: 'interactive',
            footer: 'Group Settings',
            data: [
              {
                type: 'quick_reply',
                id: '.group open',
                text: '🔓 Open Group',
              },
              {
                type: 'quick_reply',
                id: '.group close',
                text: '🔒 Close Group',
              },
            ],
          },
        });
      }
    } catch (error) {
      console.error('Group settings error:', error.message);
      await waClient.send(roomId, {
        text: `❌ Error: ${error.message}`,
        replied: message(),
      });
    }
  },
  {
    matcher: ['.group', '/group', '!group'],
    metadata: {
      description: 'Open or close the group (admin only)',
      usage: '.group - Shows interactive buttons',
      admin: true,
      botAdmin: true,
    },
  },
);
