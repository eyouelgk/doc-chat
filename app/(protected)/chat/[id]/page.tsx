"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { sendMessageToAI } from "@/app/actions/conversations"
import type { ChatActionResponse } from "@/app/actions/conversations"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { ArrowLeft, Send, User } from "lucide-react"

export default function ChatPage() {
  const { id } = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<
    { sender: "user" | "ai"; text: string | ChatActionResponse }[]
  >([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { sender: "user" as const, text: input }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setInput("")
    const documentId = id as string

    try {
      const aiResponse = await sendMessageToAI(documentId, input)
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
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto">
      <div className="flex items-center gap-4 p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Document Chat</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
            <div className="bg-primary/10 rounded-full p-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Start a conversation
              </p>
              <p className="max-w-md">
                Ask questions about your document to get insights and
                information.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {typeof msg.text === "string"
                ? msg.text
                : JSON.stringify(msg.text)}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-3 max-w-[80%]">
              <div className="flex space-x-2">
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></div>
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            name="message"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
            className="flex-1"
            disabled={loading}
            autoComplete="off"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
