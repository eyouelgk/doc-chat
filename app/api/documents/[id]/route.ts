import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/get-data"
import { db } from "@/db"
import { documents } from "@/db/schema"
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

    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1)

    if (!document) {
      return withCORS(
        NextResponse.json({ error: "Document not found" }, { status: 404 })
      )
    }

    if (document.userId !== user.id) {
      return withCORS(
        NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      )
    }

    return withCORS(NextResponse.json({ document }))
  } catch (error) {
    console.error("Error fetching document:", error)
    return withCORS(
      NextResponse.json({ error: "Failed to fetch document" }, { status: 500 })
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

    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1)

    if (!document) {
      return withCORS(
        NextResponse.json({ error: "Document not found" }, { status: 404 })
      )
    }

    if (document.userId !== user.id) {
      return withCORS(
        NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      )
    }

    await db.delete(documents).where(eq(documents.id, id))

    return withCORS(NextResponse.json({ success: true }))
  } catch (error) {
    console.error("Error deleting document:", error)
    return withCORS(
      NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
    )
  }
}
export async function PATCH(
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
    const { fileName } = await req.json()

    if (!fileName) {
      return withCORS(
        NextResponse.json({ error: "Missing fileName" }, { status: 400 })
      )
    }

    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1)

    if (!document) {
      return withCORS(
        NextResponse.json({ error: "Document not found" }, { status: 404 })
      )
    }

    if (document.userId !== user.id) {
      return withCORS(
        NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      )
    }

    await db.update(documents).set({ fileName }).where(eq(documents.id, id))

    return withCORS(NextResponse.json({ success: true }))
  } catch (error) {
    console.error("Error renaming document:", error)
    return withCORS(
      NextResponse.json({ error: "Failed to rename document" }, { status: 500 })
    )
  }
}
