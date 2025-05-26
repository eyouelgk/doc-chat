import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/get-data"
import { requireRole, UserRole } from "@/lib/roles"
import { db } from "@/db"
import { users } from "@/db/schema"
import { withCORS } from "@/lib/cors"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return withCORS(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      )
    }

    requireRole(user.role as UserRole, UserRole.ADMIN)

    const allUsers = await db.select().from(users)

    return withCORS(NextResponse.json({ users: allUsers }))
  } catch (error) {
    console.error("Error fetching users:", error)
    if (
      error instanceof Error &&
      error.message === "Insufficient permissions"
    ) {
      return withCORS(
        NextResponse.json({ error: "Forbidden" }, { status: 403 })
      )
    }
    return withCORS(
      NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    )
  }
}
