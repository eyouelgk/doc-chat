import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 })
  }
  try {
    const result = await db.select().from(users).where(eq(users.id, id))
    const user = result[0]
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
