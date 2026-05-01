import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'

import dotenv from 'dotenv'
dotenv.config()

// التعديل هنا: وضعنا رقمك مباشرة وفعلنا وضع الكود
global.pairingNumber = "584163272188" 
global.pairingMode = true 

const ownervb = process.env.OWNERS || "584163272188;ICHIMARU"

const ownerlist = ownervb.split(';');

global.owner = [];
for (let i = 0; i < ownerlist.length; i += 2) {
    const owner = [
        ownerlist[i],            
        ownerlist[i + 1],         
        true                        
    ];
    global.owner.push(owner);
}

global.mods = ['584163272188']
global.allowed = ['584163272188']

// Sticker WM
global.botname = "GURU-Ai"
global.packname = 'GURU┃ᴮᴼᵀ'
global.author = '𝕴𝖈𝖍𝖎𝖒𝖆𝖗𝖚'
global.thumb = fs.readFileSync('./Assets/Gurulogo.jpg')

// Status indicators
global.wait = '*⌛ _Charging..._*\n*▰▰▰▱▱▱▱▱*'
global.rwait = '⌛'
global.dmoji = '🤭'
global.done = '✅'
global.error = '❌'
global.xmoji = '🔥'

global.multiplier = 69
global.maxwarn = '3'

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
