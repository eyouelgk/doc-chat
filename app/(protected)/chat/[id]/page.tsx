"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  sendMessageToAI,
  saveConversation,
  saveMessage,
} from "@/app/actions/conversations"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import {
  Plus,
  Send,
  FileText,
  LayoutDashboard,
  MoreHorizontal,
  Settings,
  Menu,
  Copy,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { ChatSidebar } from "@/app/components/chat-sidebar"
import SignOutButton from "@/app/components/SignOutButton"
import { ThemeToggle } from "@/app/components/theme-toggle"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"

interface Message {
  id?: string
  sender: "user" | "ai"
  text: string
  timestamp?: Date
}

export default function ChatPage() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(
    searchParams.get("conversation")
  )
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [documentName, setDocumentName] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  useEffect(() => {
    if (!isStreaming && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isStreaming])

  useEffect(() => {
    async function fetchDocument() {
      try {
        const res = await fetch(`/api/documents/${id}`)
        if (res.ok) {
          const data = await res.json()
          setDocumentName(data.document?.fileName || "Document")
        }
      } catch (error) {
        console.error("Error fetching document:", error)
      }
    }
    fetchDocument()
  }, [id])

  useEffect(() => {
    async function loadMessages() {
      if (!conversationId) {
        setMessages([])
        return
      }

      try {
        const res = await fetch(`/api/messages/${conversationId}`)
        if (!res.ok) throw new Error("Failed to fetch messages")
        const data = await res.json()
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          sender: msg.role === "assistant" ? "ai" : "user",
          text: msg.content,
          timestamp: new Date(msg.createdAt),
        }))

        formattedMessages.sort(
          (
            a: { timestamp: { getTime: () => number } },
            b: { timestamp: { getTime: () => number } }
          ) => a.timestamp.getTime() - b.timestamp.getTime()
        )

        setMessages(formattedMessages)
      } catch (error) {
        console.error("Error loading messages:", error)
        toast.error("Failed to load conversation messages")
      }
    }

    loadMessages()
  }, [conversationId])

  const simulateStreaming = (
    text: string,
    callback: (chunk: string) => void
  ) => {
    const words = text.split(" ")
    let currentIndex = 0
    let currentText = ""

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        currentText += (currentIndex > 0 ? " " : "") + words[currentIndex]
        callback(currentText)
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, 50)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      sender: "user",
      text: input,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setIsStreaming(true)
    setStreamingMessage("")

    const currentInput = input
    setInput("")

    const documentId = id as string

    try {
      let convId = conversationId
      if (!convId) {
        const conversation = await saveConversation(documentId, documentName)
        if (conversation.success && conversation.conversationId) {
          convId = conversation.conversationId
          setConversationId(convId)
        }
      }

      if (convId) {
        await saveMessage(convId, "user", currentInput)
      }

      const aiResponse = await sendMessageToAI(documentId, currentInput)

      if (aiResponse.success && typeof aiResponse.aiResponse === "string") {
        simulateStreaming(aiResponse.aiResponse, (chunk) => {
          setStreamingMessage(chunk)
        })

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              sender: "ai",
              text: aiResponse.aiResponse as string,
              timestamp: new Date(),
            },
          ])
          setStreamingMessage("")
          setIsStreaming(false)

          if (convId) {
            saveMessage(convId, "assistant", aiResponse.aiResponse as string)
          }
        }, aiResponse.aiResponse.split(" ").length * 50 + 100)
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "I apologize, but I couldn't process your request. Please try again.",
            timestamp: new Date(),
          },
        ])
        setIsStreaming(false)
      }
    } catch (err) {
      console.error("Chat error:", err)
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I'm experiencing some technical difficulties. Please try again.",
          timestamp: new Date(),
        },
      ])
      setIsStreaming(false)
      toast.error("Failed to send message")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {" "}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentDocumentId={id as string}
        onConversationSelect={(convId) => {
          setConversationId(convId)
          router.push(`/chat/${id}?conversation=${convId}`)
        }}
      />
      <div className="flex flex-col flex-1 h-full">
        <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant={sidebarOpen ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSidebarOpen((open) => !open)}
                className={`flex items-center gap-2 ${
                  sidebarOpen ? "bg-muted" : ""
                }`}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  setConversationId(null)
                  setMessages([])
                  router.push(`/chat/${id}`)
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <a
                  href="/dashboard"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"
                >
                  <FileText className="h-4 w-4 text-primary-foreground" />
                </a>
                <div>
                  <a
                    href="/dashboard"
                    className="font-semibold text-foreground hover:underline focus:underline outline-none"
                  >
                    DocChat
                  </a>
                  <p className="text-xs text-muted-foreground truncate max-w-48">
                    {documentName}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/user-profile")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <SignOutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 w-full max-w-3xl mx-auto">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="bg-muted/50 rounded-full p-6">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground mb-2">
                  Start a conversation
                </p>
                <p className="text-muted-foreground max-w-md">
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
                className={`relative max-w-[56%] rounded-2xl px-4 py-3 ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.sender === "ai" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.text}</p>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-1 right-1 h-6 w-6 opacity-50 hover:opacity-100 transition-opacity"
                  onClick={() => {
                    navigator.clipboard.writeText(msg.text)
                    toast.success("Message copied to clipboard!")
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {isStreaming && streamingMessage && (
            <div className="flex justify-start">
              <div className="relative max-w-[56%] rounded-2xl px-4 py-3 bg-muted text-foreground">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                </div>
                <div className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
              </div>
            </div>
          )}

          {loading && !streamingMessage && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3 max-w-[56%]">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border bg-card/50">
          <div className="w-full max-w-3xl mx-auto p-6">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                ref={inputRef}
                name="message"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your document..."
                className="flex-1 bg-background"
                disabled={loading}
                autoComplete="off"
                autoFocus
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
