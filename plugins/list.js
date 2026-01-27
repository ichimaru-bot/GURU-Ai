import { definePlugins } from 'zaileys';

export default definePlugins(
  async (wa, ctx) => {
    const waClient = global.waClient;
    const { roomId, senderName, message } = ctx.messages;

    try {
      const pluginsInfo = wa.plugins.getPluginsInfo();

      if (!pluginsInfo || pluginsInfo.length === 0) {
        await waClient.send(roomId, {
          text: '❌ No commands available',
          replied: message(),
        });
        return;
      }

      let commandList = `╭━━━⊰ 📜 *COMMAND LIST* ⊱━━━╮
┃
`;

      pluginsInfo.forEach((plugin, index) => {
        const matchers = plugin.matcher;
        const description = plugin.metadata?.description || 'No description';
        const enabled = plugin.enabled ? '✅' : '❌';

        const mainCommand = Array.isArray(matchers)
          ? matchers
              .map((m) => (typeof m === 'string' ? m : m.toString()))
              .join(', ')
          : matchers;

        commandList += `┃ ${index + 1}. ${enabled} *${mainCommand}*\n`;
        commandList += `┃    ${description}\n`;
        commandList += '┃\n';
      });

      commandList += `╰━━━━━━━━━━━━━━━━━━━━╯

📊 Total Commands: *${pluginsInfo.length}*
`;

      await waClient.send(roomId, {
        text: commandList,
        replied: message(),
      });

      await waClient.reaction(message(), '📜');
    } catch (error) {
      console.error('List command error:', error.message);

      await waClient.send(roomId, {
        text: `❌ Error loading commands: ${error.message}`,
        replied: message(),
      });
    }
  },
  {
    matcher: ['.list', '.commands', '/list', '!list'],
    metadata: {
      description: 'Display all available commands and plugins',
    },
  },
);
