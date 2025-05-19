import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value

  // Protect the /dashboard, /chat, and /user-profile routes
  const protectedPaths = ["/dashboard", "/chat", "/user-profile"]
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*", "/user-profile/:path*"], // Apply middleware only to protected routes
}
