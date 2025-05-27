"use client"

import { useEffect, useState } from "react"
import { Button } from "@/app/components/ui/button"
import { X, MessageSquare, FileText } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import { Skeleton } from "@/app/components/ui/skeleton"

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
  onConversationSelect,
}: {
  isOpen: boolean
  onClose: () => void
  currentDocumentId: string
  onConversationSelect?: (conversationId: string) => void
}) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchConversationsData() {
    if (!isOpen || !currentDocumentId) return
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(
        `/api/conversations?documentId=${currentDocumentId}`
      )
      if (!res.ok) {
        throw new Error("Failed to fetch conversations")
      }
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error("Error fetching conversations:", error)
      setError("Failed to load conversations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversationsData()
  }, [isOpen, currentDocumentId])

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        setError("Failed to delete conversation. Please try again.")
        fetchConversationsData() // Refetch to ensure UI consistency on error
        return
      }

      setConversations((prevConversations) =>
        prevConversations.filter(
          (conversation) => conversation.id !== conversationId
        )
      )
    } catch (error) {
      console.error("Error deleting conversation:", error)
      setError("An error occurred while deleting. Please try again.")
      fetchConversationsData() // Refetch to ensure UI consistency on error
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border shadow-lg md:relative md:z-0">
        <div className="flex flex-col h-full max-h-screen">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              Conversations
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <ConversationsSkeleton />
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-sm text-destructive">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    fetchConversationsData() // Use the new function
                  }}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center gap-2 group"
                  >
                    <button
                      onClick={() => {
                        onConversationSelect?.(conversation.id)
                        onClose()
                      }}
                      className="flex-1 flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors w-full text-left"
                    >
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-foreground">
                          {conversation.title || "Untitled Conversation"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(new Date(conversation.createdAt))}
                        </p>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation() // Prevent card click
                        handleDeleteConversation(conversation.id)
                      }}
                      aria-label="Delete conversation"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  No conversations yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start chatting to see your conversations here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function ConversationsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3">
          <Skeleton className="h-4 w-4 mt-1 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
