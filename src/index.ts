import { Client, Message } from 'discord.js'
import { highlightAuto } from 'highlight.js'

const client = new Client()

client.once('ready', () => console.log('READY'))

const commandName = '>highlight'
const languageSubset = ['javascript', 'typescript']

const sendHighlightedCode = async (targetMessage: Message, executorMessage: Message): Promise<Message> => {
  if (targetMessage.author.bot || targetMessage.system) return executorMessage.reply('ボットまたはシステムが送信したメッセージはハイライトできません。')
  const code = highlightAuto(targetMessage.content, languageSubset).language

  return executorMessage.reply(targetMessage.content, { code })
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
client.on('message', async message => {
  const author = message.author
  if (author.bot || message.system) return
  if (!message.content.startsWith(commandName)) return

  const targetId = (/(?<targetId>\d{17,19})/u).exec(message.content)?.groups?.targetId

  if (!targetId) return message.channel.messages.fetch({ before: message.id, limit: 1 })
    .then(messages => messages.first())
    .then(target => {
      if (!target) throw new Error('ハイライトするメッセージを取得できませんでした。')
      
      return sendHighlightedCode(target, message)
    })
    .catch(reason => message.reply(reason, { code: 'js' }))

  return message.channel.messages.fetch(targetId)
    .then(target => sendHighlightedCode(target, message))
    .catch(reason => message.reply(reason, { code: 'js' }))
})

client.login()
  .catch(console.error)
