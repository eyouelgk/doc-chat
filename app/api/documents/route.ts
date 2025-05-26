import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getDocuments } from "@/lib/get-data"
import { withCORS } from "@/lib/cors"

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return withCORS(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    )
  }
  const documents = await getDocuments(user.id)
  return withCORS(NextResponse.json({ documents }))
}
