"use client"

import { useEffect, useState } from "react"
import { Button } from "@/app/components/ui/button"
import { X, MessageSquare, FileText } from "lucide-react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"

type Conversation = {
  id: string
  title: string
  createdAt: string
  documentId: string
  documentName?: string
}

export function ChatSidebar({
  isOpen,
  onClose,
  currentDocumentId,
}: {
  isOpen: boolean
  onClose: () => void
  currentDocumentId: string
}) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchConversations() {
      try {
        setLoading(true)
        const res = await fetch("/api/conversations")
        if (res.ok) {
          const data = await res.json()
          setConversations(data.conversations || [])
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchConversations()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 md:bg-transparent md:inset-auto md:relative md:z-0">
      <div className="absolute inset-y-0 left-0 w-3/4 max-w-xs bg-background border-r shadow-lg md:relative md:w-64 md:shadow-none">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-2">
            {loading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <Link
                    key={conversation.id}
                    href={`/chat/${conversation.documentId}?conversation=${conversation.id}`}
                    className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors ${
                      conversation.documentId === currentDocumentId
                        ? "bg-muted"
                        : ""
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {conversation.title || "Untitled Conversation"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(new Date(conversation.createdAt))}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No conversations yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      <div className="absolute inset-0 md:hidden" onClick={onClose}></div>
    </div>
  )
}
