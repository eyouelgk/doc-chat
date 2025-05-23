import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/get-data"
import { db } from "@/db"
import { conversations } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const documentId = searchParams.get("documentId")

    let query = db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, user.id))
      .orderBy(desc(conversations.updatedAt))

    if (documentId) {
      query = db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.userId, user.id),
            eq(conversations.documentId, documentId)
          )
        )
        .orderBy(desc(conversations.updatedAt))
    }

    const userConversations = await query

    return NextResponse.json({ conversations: userConversations })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}
