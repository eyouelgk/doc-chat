import { compare, hash } from "bcrypt"
import { cookies } from "next/headers"
import { db } from "@/db"
import { users } from "@/db/schema"
import * as jose from "jose"
import { cache } from "react"
import { eq } from "drizzle-orm"

// JWT types
interface JWTPayload {
  userId: string
  [key: string]: string | number | boolean | null | undefined
}
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set")
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const JWT_EXPIRATION = "7d"
const REFRESH_THRESHOLD = 24 * 60 * 60

export async function hashPassword(password: string) {
  return hash(password, 10)
}
export async function verifyPassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword)
}
export async function createUser(
  userName: string,
  email: string,
  password: string
) {
  const hashedPassword = await hashPassword(password)
  const id = crypto.randomUUID()
  try {
    await db.insert(users).values({
      id,
      userName,
      email,
      hashedPassword,
    })
    return { id, userName, email }
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}
export async function updateUser(id: string, data: Partial<any>) {
  try {
    await db.update(users).set(data).where(eq(users.id, id))
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}
export async function changePassword(id: string, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword)
  try {
    await db.update(users).set({ hashedPassword }).where(eq(users.id, id))
  } catch (error) {
    console.error("Error changing password:", error)
    return null
  }
}
export async function deleteUser(id: string) {
  try {
    await db.delete(users).where(eq(users.id, id))
  } catch (error) {
    console.error("Error deleting user:", error)
    return null
  }
}
export async function generateJWT(payload: JWTPayload) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET)
}
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}
export async function shouldRefreshToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      clockTolerance: 15,
    })

    const exp = payload.exp as number
    const now = Math.floor(Date.now() / 1000)

    return exp - now < REFRESH_THRESHOLD
  } catch {
    return false
  }
}
export async function createSession(userId: string) {
  try {
    const token = await generateJWT({ userId })
    const cookieStore = await cookies()
    cookieStore.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax",
    })
    return true
  } catch (error) {
    console.error("Error creating session:", error)
    return false
  }
}
export const getSession = cache(async () => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) return null
    const payload = await verifyJWT(token)

    return payload ? { userId: payload.userId } : null
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("During prerendering, `cookies()` rejects")
    ) {
      console.log(
        "Cookies not available during prerendering, returning null session"
      )
      return null
    }

    console.error("Error getting session:", error)
    return null
  }
})
export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
}
