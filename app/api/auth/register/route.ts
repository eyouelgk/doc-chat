import { NextRequest, NextResponse } from "next/server"
import { createUser, createSession } from "@/lib/auth"
import { getUserByEmail } from "@/lib/get-data"
import { withCORS } from "@/lib/cors"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body
    if (!email || !password || !name) {
      return withCORS(
        NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      )
    }
    const existing = await getUserByEmail(email)
    if (existing) {
      return withCORS(
        NextResponse.json({ error: "User already exists" }, { status: 400 })
      )
    }
    const user = await createUser(name, email, password)
    if (!user) {
      return withCORS(
        NextResponse.json({ error: "Failed to create user" }, { status: 500 })
      )
    }
    await createSession(user.id)
    return withCORS(
      NextResponse.json(
        {
          id: user.id,
          email: user.email,
          name: user.name || null,
        },
        { status: 201 }
      )
    )
  } catch (error) {
    return withCORS(
      NextResponse.json({ error: "Server error" }, { status: 500 })
    )
  }
}
