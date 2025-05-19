"use client"

import Link from "next/link"

const ChatPage = () => {
  return (
    <div>
      <Link href="/">Go to Home</Link>
      <Link href="/dashboard">Go to Dashboard</Link> <h1>Chat</h1>
      <p>Welcome to the chat page!</p>
    </div>
  )
}

export default ChatPage
