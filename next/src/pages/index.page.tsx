import { buildApiClient } from "@/utils/buildApiClient"
import { useEffect, useState } from "react"
import styles from "./index.module.scss"
import { v4 as uuid } from "uuid"

type Message = {
  id: string
  role: "user" | "assistant"
  message: string
  timestamp: number
}

const MAX_MESSAGE_LENGTH = 2000

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([{
    id: uuid(),
    role: "assistant",
    message: "こんにちは！AI 天ちゃんです！メッセージを送ってね",
    timestamp: new Date().getTime(),
  }])

  useEffect(() => {
    scrollTo(0, document.body.scrollHeight)
  }, [messages])

  const onButtonClick = async () => {
    const client = buildApiClient()
    setLoading(true)
    try {
      const newMessages = [
        ...messages,
        {
        id: uuid(),
        role: "user",
        message,
        timestamp: new Date().getTime(),
      }] as Message[]
      setMessages(newMessages)

      const messagesToSend = [] as Message[]
      let totalMessageLen = 0
      for (let i = 0; i < newMessages.length; i++) {
        const m = newMessages[i]
        const mLen = m.message.length
        if (totalMessageLen + mLen > MAX_MESSAGE_LENGTH) {
          break
        } else {
          messagesToSend.push(m)
          totalMessageLen += mLen
        }
      }

      const res = await client.callTen(
        messagesToSend.map(m => { return { role: m.role, content: m.message } })
      )
      setMessages([
        ...newMessages,
        {
        id: uuid(),
        role: "assistant",
        message: res,
        timestamp: new Date().getTime(),
      }])
      setMessage("")
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }
  const onMessageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onButtonClick()
    }
  }
  const onMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.currentTarget.value)
  }
  return (
    <div className={styles.frame}>
      <div className={styles.header}>AI 天ちゃん</div>
      <div className={styles.messages}>
        {messages.map((m) => (
          <div className={styles.message} data-id={m.id} key={m.id}>
            <div className={styles.role}>{m.role}</div>
            <div className={styles.text}>{m.message}</div>
          </div>
        ))}
      </div>
      <div className={styles.inputArea}>
        <input onChange={onMessageChange} disabled={loading} value={message}
        onKeyDown={onMessageKeyDown}
        />
        <button onClick={onButtonClick} disabled={loading || !message}>メッセージを送る</button>
      </div>
    </div>
  )
}
