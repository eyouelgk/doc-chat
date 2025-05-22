"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  sendMessageToAI,
  saveConversation,
  saveMessage,
} from "@/app/actions/conversations"
import type { ChatActionResponse } from "@/app/actions/conversations"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { ArrowLeft, Send, User, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { ChatSidebar } from "@/app/components/chat-sidebar"
import SignOutButton from "@/app/components/SignOutButton"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export default function ChatPage() {
  const { id } = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<
    { sender: "user" | "ai"; text: string | ChatActionResponse }[]
  >([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()

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
      // Create or get conversation ID
      let convId = conversationId
      if (!convId) {
        const conversation = await saveConversation(documentId)
        if (conversation.success && conversation.conversationId) {
          convId = conversation.conversationId
          setConversationId(convId)
        }
      }

      // Save user message
      if (convId) {
        await saveMessage(convId, "user", input)
      }

      // Get AI response
      const aiResponse = await sendMessageToAI(documentId, input)

      // Save AI message
      if (
        convId &&
        aiResponse.success &&
        typeof aiResponse.aiResponse === "string"
      ) {
        await saveMessage(convId, "assistant", aiResponse.aiResponse)
      }

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: aiResponse.aiResponse || "No response." },
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex h-screen">
      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentDocumentId={id as string}
      />

      <div className="flex flex-col flex-1 h-full">
        <div className="flex items-center justify-between gap-4 p-4 border-b">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">DocuChat</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              Conversations
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/user-profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <SignOutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
    </div>
  )
}
