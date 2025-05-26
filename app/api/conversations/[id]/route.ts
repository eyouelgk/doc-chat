import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getConversation, getMessages } from "@/lib/get-data"
import { db } from "@/db"
import { conversations } from "@/db/schema"
import { eq } from "drizzle-orm"
import { withCORS } from "@/lib/cors"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return withCORS(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      )
    }

    const { id } = await params

    const conversation = await getConversation(id)

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

    const messages = await getMessages(id)

    return withCORS(NextResponse.json({ conversation, messages }))
  } catch (error) {
    console.error(`Error fetching conversation:`, error)
    return withCORS(
      NextResponse.json(
        { error: "Failed to fetch conversation" },
        { status: 500 }
      )
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return withCORS(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      )
    }

    const { id } = await params

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1)

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

    await db.delete(conversations).where(eq(conversations.id, id))

    return withCORS(NextResponse.json({ success: true }))
  } catch (error) {
    console.error(`Error deleting conversation:`, error)
    return withCORS(
      NextResponse.json(
        { error: "Failed to delete conversation" },
        { status: 500 }
      )
    )
  }
}
