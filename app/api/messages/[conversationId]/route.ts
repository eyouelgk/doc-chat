import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getConversation, getMessages } from "@/lib/get-data"
import { withCORS } from "@/lib/cors"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return withCORS(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      )
    }

    const { conversationId } = await params

    const conversation = await getConversation(conversationId)

    if (!conversation) {
      return withCORS(
        NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      )
    }

    if (conversation.userId !== user.id) {
      return withCORS(
        NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      )
    }

    const messages = await getMessages(conversationId)

    return withCORS(NextResponse.json({ messages }))
  } catch (error) {
    console.error(`Error fetching messages:`, error)
    return withCORS(
      NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    )
  }
}
