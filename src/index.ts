import { AwaitMessagesOptions, Client, Collection, Message } from 'discord.js'
import { highlightAuto, listLanguages } from 'highlight.js'

const client = new Client()

client.once('ready', () => console.log('READY'))

const commandName = '>highlight'
const languageSubset = listLanguages().filter(value => value !== 'livecodeserver')
const awaitMessageOptions: AwaitMessagesOptions = {
  max: 1,
  time: 30000,
  errors: ['time']
}

const sendHighlightedCode = async (targetMessage: Message, executorMessage: Message): Promise<Message> => {
  if (targetMessage.author.bot || targetMessage.system) return executorMessage.reply('ボットまたはシステムが送信したメッセージはハイライトできません。')
  const code = highlightAuto(targetMessage.content, languageSubset).language

  return executorMessage.reply(targetMessage.content, { code })
}

// eslint-disable-next-line max-len
const awaitMessages = async (message: Message): Promise<Message> => message.channel.awaitMessages((target: Message) => target.author.id === message.author.id, awaitMessageOptions)
  .then(collected => collected.first() as Message)
  .then(target => message.channel.messages.fetch(target.content))
  .then(target => sendHighlightedCode(target, message))

// eslint-disable-next-line @typescript-eslint/no-misused-promises
client.on('message', async message => {
  const author = message.author
  if (author.bot || message.system) return
  if (!message.content.startsWith(commandName)) return

  const targetId = (/^(?<targetId>\d{17,19})$/us).exec(message.content)?.groups?.targetId

  if (!targetId) return message.reply('ハイライトするメッセージのIDを送信してください、')
    .then(() => awaitMessages(message))
    .catch(reason => {
      if (reason instanceof Collection) return message.reply('30秒経過してもIDが送信されないため、コレクターを終了しました。', { code: true })
        .then(message => message.delete({ timeout: 10000 }))
  
      return message.reply(reason, { code: 'js' })
    })

  return message.channel.messages.fetch(targetId)
    .then(target => sendHighlightedCode(target, message))
    .catch(reason => message.reply(reason, { code: 'js' }))
})

client.login()
  .catch(console.error)
