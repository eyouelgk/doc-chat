import { db } from "@/db"
import { getSession } from "./auth"
import { eq } from "drizzle-orm"
import { cache } from "react"
import {
  users,
  conversations,
  documentChunks,
  documents,
  messages,
} from "@/db/schema"
import { unstable_cacheTag as cacheTag } from "next/cache"

export const getCurrentUser = cache(async () => {
  const session = await getSession()
  if (!session) return null
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
})
export const getUserByEmail = cache(async (email: string) => {
  try {
    const result = await db.select().from(users).where(eq(users.email, email))
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
})
export const getUserById = cache(async (id: string) => {
  try {
    const result = await db.select().from(users).where(eq(users.id, id))
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
})
export async function getConversation(id: string) {
  try {
    const result = await db.query.conversations.findFirst({
      where: eq(conversations.id, id),
      with: {
        user: true,
      },
    })
    return result
  } catch (error) {
    console.error(`Error fetching conversation ${id}:`, error)
    throw new Error("Failed to fetch conversation")
  }
}
export async function getConversations() {
  "use cache"
  cacheTag("conversations")
  try {
    const result = await db.query.conversations.findMany({
      with: {
        user: true,
      },
      orderBy: (conversations, { desc }) => [desc(conversations.createdAt)],
    })
    return result
  } catch (error) {
    console.error("Error fetching conversations:", error)
    throw new Error("Failed to fetch conversations")
  }
}
export async function getMessages(id: string) {
  "use cache"
  cacheTag("messages")
  try {
    const result = await db.query.messages.findMany({
      where: eq(messages.conversationId, id),
      orderBy: (messages, { desc }) => [desc(messages.createdAt)],
    })
    return result
  } catch (error) {
    console.error(`Error fetching messages for conversation ${id}:`, error)
    throw new Error("Failed to fetch messages")
  }
}
export async function getDocument(id: string) {
  "use cache"
  cacheTag("documents")
  try {
    const result = await db.query.documents.findFirst({
      where: eq(documents.id, id),
    })
    return result
  } catch (error) {
    console.error(`Error fetching document ${id}:`, error)
    throw new Error("Failed to fetch document")
  }
}
export async function getDocuments(id: string) {
  "use cache"
  cacheTag("documents")
  try {
    const result = await db.query.documents.findMany({
      where: eq(documents.userId, id),
      orderBy: (documents, { desc }) => [desc(documents.createdAt)],
    })
    return result
  } catch (error) {
    console.error("Error fetching documents:", error)
    throw new Error("Failed to fetch documents")
  }
}
export async function getDocumentChunks(documentId: string) {
  "use cache"
  cacheTag("documentChunks")
  try {
    const result = await db.query.documentChunks.findMany({
      where: eq(documentChunks.documentId, documentId),
      orderBy: (documentChunks, { asc }) => [asc(documentChunks.chunkIndex)],
    })
    return result
  } catch (error) {
    console.error(`Error fetching document chunks for ${documentId}:`, error)
    throw new Error("Failed to fetch document chunks")
  }
}
