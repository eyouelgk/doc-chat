import { NextRequest, NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/get-data"
import { verifyPassword, createSession, deleteSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      )
    }
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }
    const valid = await verifyPassword(password, user.hashedPassword)
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }
    await deleteSession()
    await createSession(user.id)
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
