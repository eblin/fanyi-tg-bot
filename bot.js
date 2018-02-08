// load .env config
require('dotenv').config()
const Telegraf = require('telegraf')
const bot = new Telegraf(process.env.BOT_TG_TOKEN)
const request = require('request')
const fs = require('fs')
const path = require('path')
const translateToChinese = require('./translate')
const audioToText = require('./speech')

bot.telegram.getMe().then((botInfo) => {
  bot.options.username = botInfo.username
  console.log('Server has initialized bot. username: ' + botInfo.username)
})
const cleanMsg = function (text) {
  return text.replace('@' + bot.options.username, '')
}
const translateMessage = async function (text) {
  try {
    return await translateToChinese(cleanMsg(text))
  } catch (err) {
    console.error(err)
  }
}
const mentionsBot = function (text) {
  const botName = bot.options.username
  // Let's see if someone is mentioning the bot
  return (text.indexOf(botName) > -1 || text.indexOf(botName.toLowerCase()) > -1)
}
const voiceNoteToText = async function (ctx) {
  const voiceNote = ctx.message.voice
  const link = await ctx.telegram.getFileLink(voiceNote.file_id)
  const audioFilePath = await downloadVoiceNote(link, voiceNote)
  const transcription = await audioToText(audioFilePath)
  // delete tmp file
  fs.unlink(audioFilePath, (err) => {
    if (err) throw err
    console.log('Deleted file: ' + audioFilePath)
  })
  return transcription
}
const downloadVoiceNote = function (link, voice) {
  const filePath = path.resolve('./tmp/' + voice.file_id + '.ogg')
  return new Promise(resolve => {
    request(link).pipe(fs.createWriteStream(filePath)).on('finish', () => {
      resolve(filePath)
    })
  })
}
const handleVoiceNoteMessage = function (ctx) {
  voiceNoteToText(ctx).then(text => {
    translateMessage(text).then(msg => {
      const markdown = '_I heard you said:_\n\n```' + text + '```\n\n*in chinese (simplified):*\n\n```' + msg + '```'
      ctx.replyWithMarkdown(markdown)
    })
  })
}
const handleTextMessage = function (ctx) {
  translateMessage(ctx.message.text).then(msg => {
    ctx.reply(msg)
  }).catch(err => {
    console.error(err)
  })
}

// start listening to messages
bot.on('message', (ctx) => {
  // console.log(ctx.message)
  // only respond to DMs from here...
  if (ctx.message.chat.type === 'private') {
    if (ctx.message.text) {
      handleTextMessage(ctx)
    }
    if (ctx.message.voice) {
      ctx.reply('I hear you, give me a second...')
      handleVoiceNoteMessage(ctx)
    }
  }
  // Let's see if someone is mentioning the bot and respond
  if (ctx.message.text && mentionsBot(ctx.message.text)) {
    handleTextMessage(ctx)
  }
  // We can uncomment this if we want to handle group voice messages
  // if (ctx.message.voice) {
  //   handleVoiceNoteMessage(ctx)
  // }
})
bot.command('wtf', (ctx) => ctx.reply('😘'))
bot.command('leave', (ctx) => {
  if (ctx.from.username === 'eblin') {
    ctx.leaveChat()
  }
})
bot.catch((err) => {
  console.error('Ooops', err)
})
bot.startPolling()
