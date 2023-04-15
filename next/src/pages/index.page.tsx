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

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])

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
      const res = await client.callTen(
          newMessages.map(m => { return { role: m.role, content: m.message } })
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
