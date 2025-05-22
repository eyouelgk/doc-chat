import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getDocuments } from "@/lib/get-data"

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const documents = await getDocuments(user.id)
  return NextResponse.json({ documents })
}
