"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

const ChatPage = () => {
  const params = useParams()
  const chatId = params?.id

  return (
    <div>
      <Link href="/">Go to Home</Link>
      <Link href="/dashboard">Go to Dashboard</Link> <h1>Chat</h1>
      <p>Welcome to the chat page!</p>
      <p>Chat ID: {chatId}</p>
    </div>
  )
}

export default ChatPage
