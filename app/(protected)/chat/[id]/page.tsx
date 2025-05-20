"use client"

import { useState } from "react"
import Link from "next/link"
import { sendMessageToAI } from "@/app/actions/conversations"
import { ChatActionResponse } from "@/app/actions/conversations"
import { useParams } from "next/navigation"

export default function ChatPage() {
  const { id } = useParams()
  const [messages, setMessages] = useState<
    { sender: "user" | "ai"; text: string | ChatActionResponse }[]
  >([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { sender: "user" as const, text: input }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setInput("")

    // Send message to AI and get response
    try {
      const aiResponse = await sendMessageToAI(id as string, input)
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: aiResponse || "No response." },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Error getting response." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        padding: 24,
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Link href="/">Go to Home</Link> |{" "}
        <Link href="/dashboard">Go to Dashboard</Link>
      </div>
      <h1>Chat</h1>
      <div
        style={{
          minHeight: 300,
          background: "#fafafa",
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
          overflowY: "auto",
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "#888" }}>
            No messages yet. Start the conversation!
          </p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "8px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 16,
                background: msg.sender === "user" ? "#d1e7dd" : "#e2e3e5",
                color: "#222",
                maxWidth: "70%",
                wordBreak: "break-word",
              }}
            >
              {typeof msg.text === "string"
                ? msg.text
                : JSON.stringify(msg.text)}
            </span>
          </div>
        ))}
        {loading && (
          <div
            style={{ textAlign: "left", color: "#888", fontStyle: "italic" }}
          >
            AI is typing…
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          name="message"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
          disabled={loading}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{ padding: "8px 16px", borderRadius: 8 }}
        >
          Send
        </button>
      </form>
    </div>
  )
}
