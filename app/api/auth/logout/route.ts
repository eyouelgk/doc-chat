import { NextRequest, NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"
import { withCORS } from "@/lib/cors"

export async function POST(request: NextRequest) {
  await deleteSession()
  return withCORS(NextResponse.json({ success: true }))
}
