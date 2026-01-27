import { Client } from "zaileys";

const wa = new Client({
  authType: "pairing",
  phoneNumber:917788861848,
  fancyLogs: true,
  fakeReply: {
    provider: "whatsapp",
  },
  pluginsDir: 'plugins', 
  pluginsHmr: true,
  citation: {
    authors: async () => {
      return [46957280153761];
    },
  },
  sticker: {
    packageName: 'GURU-Ai',
    authorName: 'Guru',
    quality: 80,
    shape: 'rounded',
  },
});

global.waClient = wa;

wa.use(async (ctx) => {
  const m = ctx.messages?.message?.();
  
  if (m?.message) {
    if (m.message.buttonsResponseMessage) {
      ctx.messages.text = m.message.buttonsResponseMessage.selectedButtonId || '';
    } else if (m.message.templateButtonReplyMessage) {
      ctx.messages.text = m.message.templateButtonReplyMessage.selectedId || '';
    } else if (m.message.listResponseMessage) {
      ctx.messages.text = m.message.listResponseMessage.singleSelectReply?.selectedRowId || '';
    }
  }
});