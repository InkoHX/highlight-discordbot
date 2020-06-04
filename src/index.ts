import { AwaitMessagesOptions, Client, Message } from 'discord.js'
import { highlightAuto } from 'highlight.js'

const client = new Client()

client.once('ready', () => console.log('READY'))

const commandName = '>highlight'
const awaitMessageOptions: AwaitMessagesOptions = {
  max: 1,
  time: 30000,
  errors: ['time']
}

const handleMessageHighlight = async (message: Message): Promise<Message> => {
  const target = await message.channel.messages.fetch(message.content).catch(() => null)
  if (!target) return message.reply('対象のメッセージが取得できませんでした。IDを間違えている可能性があります。')
  const languageCode = highlightAuto(target.content, ['typescript', 'javascript']).language

  console.log(languageCode)

  return message.channel.send(target.content, { code: languageCode, split: true })
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
client.on('message', async message => {
  const author = message.author
  if (author.bot || message.system) return
  if (!message.content.startsWith(commandName)) return

  await message.reply('ハイライトするメッセージのIDを送信してください。')
    .then(sendMsg => sendMsg.delete({ timeout: 15000 }))

  return message.channel.awaitMessages((message: Message) => author.id === message.author.id, awaitMessageOptions)
    .then(collected => collected.first() as Message)
    .then(message => handleMessageHighlight(message))
    .catch(() => message.reply('30秒経過してもIDが送信されなかったため、コレクターを終了しました。').then(sendMsg => sendMsg.delete({ timeout: 10000 })))
})

client.login()
  .catch(console.error)
