import { NextRequest, NextResponse } from "next/server"
import { createUser, createSession } from "@/lib/auth"
import { getUserByEmail } from "@/lib/get-data"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    const existing = await getUserByEmail(email)
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }
    const user = await createUser(name, email, password)
    if (!user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      )
    }
    await createSession(user.id)
    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name || null,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
