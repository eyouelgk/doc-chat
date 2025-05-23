import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getConversation, getMessages } from "@/lib/get-data"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversationId } = await params

    const conversation = await getConversation(conversationId)

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    if (conversation.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const messages = await getMessages(conversationId)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error(`Error fetching messages:`, error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}
