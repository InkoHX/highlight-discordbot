import { Client, Message } from 'discord.js'
import { highlightAuto } from 'highlight.js'
import { format } from 'prettier'

type Nullable<T> = T | undefined | null 
type LanguageSubset = 'typescript' | 'javascript' | 'yaml' | 'json'

const client = new Client()

client.once('ready', () => console.log('READY'))

const commandName = '>highlight'
const languageSubset: LanguageSubset[] = ['javascript', 'typescript', 'yaml', 'json']

const sendHighlightedCode = (targetMessage: Message, executorMessage: Message): Promise<Message> => {
  if (targetMessage.author.bot || targetMessage.system) return executorMessage.reply('ボットまたはシステムが送信したメッセージはハイライトできません。')
  const code = highlightAuto(targetMessage.cleanContent, languageSubset).language as Nullable<LanguageSubset> ?? 'livecodeserver'

  const parser = code === 'javascript'
    ? 'typescript'
    : code === 'livecodeserver'
      ? 'typescript'
      : code

  try {
    const formattedContent = format(targetMessage.cleanContent, { parser })

    return executorMessage.reply(formattedContent, { code })
  } catch (_error) {
    return executorMessage.reply('フォーマット中にエラーが発生したため、ハイライトのみ実行されました。')
      .then(message => message.channel.send(targetMessage.cleanContent, { code }))
  }
}

const isHighlightCommand = (message: Message): boolean => {
  const clientUser = message.client.user

  if (message.content.startsWith(commandName)) return true
  if (clientUser && message.mentions.has(clientUser)) return true

  return false
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
client.on('message', message => {
  const author = message.author
  if (author.bot || message.system) return
  if (!isHighlightCommand(message)) return

  const targetId = (/(?<targetId>\d{17,19})/u).exec(message.cleanContent)?.groups?.targetId

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
