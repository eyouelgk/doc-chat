import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/get-data"
import { updateUser, deleteUser } from "@/lib/auth"
import { withCORS } from "@/lib/cors"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return withCORS(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      )
    }

    return withCORS(
      NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      })
    )
  } catch (error) {
    console.error("Error fetching user data:", error)
    return withCORS(
      NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
    )
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return withCORS(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    )
  }
  try {
    const body = await request.json()
    const { name } = body
    if (typeof name !== "string") {
      return withCORS(
        NextResponse.json({ error: "Invalid input" }, { status: 400 })
      )
    }
    await updateUser(user.id, { name, updatedAt: new Date() })
    return withCORS(
      NextResponse.json({
        id: user.id,
        email: user.email,
        name,
        createdAt: user.createdAt,
        updatedAt: new Date(),
      })
    )
  } catch (error) {
    return withCORS(
      NextResponse.json({ error: "Server error" }, { status: 500 })
    )
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return withCORS(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    )
  }
  try {
    await deleteUser(user.id)
    return withCORS(NextResponse.json({ success: true }))
  } catch (error) {
    return withCORS(
      NextResponse.json({ error: "Server error" }, { status: 500 })
    )
  }
}
