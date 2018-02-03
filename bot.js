// load .env config
require('dotenv').config()
const Telegraf = require('telegraf')
const bot = new Telegraf(process.env.BOT_TG_TOKEN)
bot.telegram.getMe().then((botInfo) => {
  bot.options.username = botInfo.username
  console.log('Server has initialized bot. username: ' + botInfo.username)
})
const translateToChinese = require('./translate')
const cleanMsg = function (msg) {
  return msg.text.replace('@' + bot.options.username, '')
}

bot.command('wtf', (ctx) => ctx.reply('😘'))
bot.command('leave', (ctx) => {
  if (ctx.from.username === 'eblin') {
    ctx.leaveChat()
  }
})
bot.on('message', (ctx) => {
  // only respond to DMs from here...
  if (ctx.message.chat.type === 'private') {
    translateToChinese(cleanMsg(ctx.message)).then(msg => {
      // const markdown = `*You Said:*\n${ctx.message.text}\n*Chinese:*\n${msg}`
      // ctx.replyWithMarkdown(markdown)
      ctx.reply(msg)
    }).catch(err => {
      console.error(err)
    })
  }
})
// respond to mentions
bot.entity('mention', (ctx) => {
  const botName = bot.options.username
  // Let's see if someone is mentioning the bot
  if (ctx.message.text.indexOf(botName) > -1) {
    // console.log('mentions bot', ctx.message)
    translateToChinese(cleanMsg(ctx.message)).then(msg => {
      ctx.reply(msg)
    })
  }
})
bot.catch((err) => {
  console.error('Ooops', err)
})
bot.startPolling()
