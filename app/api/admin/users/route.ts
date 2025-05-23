import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/get-data"
import { requireRole, UserRole } from "@/lib/roles"
import { db } from "@/db"
import { users } from "@/db/schema"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role
    requireRole(user.role as UserRole, UserRole.ADMIN)

    const allUsers = await db.select().from(users)

    return NextResponse.json({ users: allUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    if (
      error instanceof Error &&
      error.message === "Insufficient permissions"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}
