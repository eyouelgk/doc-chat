"use client"
import React, { useState } from "react"

type Message = {
  id: number
  sender: "me" | "other"
  text: string
  timestamp: string
}

const mockMessages: Message[] = [
  { id: 1, sender: "me", text: "Hello!", timestamp: "10:00 AM" },
  { id: 2, sender: "other", text: "Hi there!", timestamp: "10:01 AM" },
  { id: 3, sender: "me", text: "How are you?", timestamp: "10:02 AM" },
  { id: 4, sender: "other", text: "Good! And you?", timestamp: "10:03 AM" },
]

type ChatInterfaceProps = {
  chatId: string
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatId }) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        sender: "me",
        text: input,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ])
    setInput("")
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "500px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        maxWidth: "400px",
        margin: "0 auto",
        background: "#fff",
      }}
    >
      <div
        style={{
          padding: "12px",
          borderBottom: "1px solid #eee",
          fontWeight: "bold",
        }}
      >
        Chat with User
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          background: "#f9f9f9",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.sender === "me" ? "flex-end" : "flex-start",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                background: msg.sender === "me" ? "#d1e7dd" : "#e2e3e5",
                color: "#222",
                padding: "8px 12px",
                borderRadius: "16px",
                maxWidth: "70%",
                wordBreak: "break-word",
              }}
            >
              {msg.text}
            </div>
            <span
              style={{ fontSize: "0.75em", color: "#888", marginTop: "2px" }}
            >
              {msg.timestamp}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          borderTop: "1px solid #eee",
          padding: "8px",
          background: "#fafafa",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "16px",
            border: "1px solid #ccc",
            marginRight: "8px",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend()
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: "8px 16px",
            borderRadius: "16px",
            border: "none",
            background: "#0d6efd",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatInterface
