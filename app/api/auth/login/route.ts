import { NextRequest, NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/get-data"
import { verifyPassword, createSession, deleteSession } from "@/lib/auth"
import { withCORS } from "@/lib/cors"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    if (!email || !password) {
      return withCORS(
        NextResponse.json(
          { error: "Email and password required" },
          { status: 400 }
        )
      )
    }
    const user = await getUserByEmail(email)
    if (!user) {
      return withCORS(
        NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      )
    }
    const valid = await verifyPassword(password, user.hashedPassword)
    if (!valid) {
      return withCORS(
        NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      )
    }
    await deleteSession()
    await createSession(user.id)
    return withCORS(
      NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
    )
  } catch (error) {
    return withCORS(
      NextResponse.json({ error: "Server error" }, { status: 500 })
    )
  }
}
