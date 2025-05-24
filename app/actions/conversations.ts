"use server"

import { initiateChatWithDocument } from "@/lib/chat"
import { db } from "@/db"
import { conversations, messages } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/lib/get-data"
import { revalidateTag } from "next/cache"

export type ChatActionResponse = {
  success: boolean
  message?: string
  aiResponse?: string
  error?: string
}

export type ConversationActionResponse = {
  success: boolean
  message?: string
  conversationId?: string
  error?: string
}

export async function sendMessageToAI(
  documentId: string,
  message: string
): Promise<ChatActionResponse> {
  try {
    const chain = await initiateChatWithDocument(documentId)
    if (!chain) {
      return { success: false, error: "Failed to initiate chat" }
    }

    if (!message) {
      return { success: false, error: "Missing message" }
    }

    const enhancedPrompt = `Based on the document content, please answer the following question. 
    Provide a comprehensive and helpful response that draws from the document's information. 
    If the question relates to topics not covered in the document, you may provide general knowledge 
    but clearly indicate when you're going beyond the document's scope.
    
    Question: ${message}`

    const aiResponse = await chain.invoke(enhancedPrompt)
    return { success: true, aiResponse }
  } catch (error) {
    console.error("AI chat error:", error)
    return { success: false, error: "Failed to get AI response" }
  }
}

export async function saveConversation(
  documentId: string,
  title?: string
): Promise<ConversationActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: "Unauthorized access",
        error: "Unauthorized",
      }
    }

    const [conversation] = await db
      .insert(conversations)
      .values({
        userId: user.id,
        documentId,
        title: title || "New Conversation",
      })
      .returning()

    revalidateTag("conversations")

    return {
      success: true,
      message: "Conversation created successfully",
      conversationId: conversation.id,
    }
  } catch (error) {
    console.error("Error creating conversation:", error)
    return {
      success: false,
      message: "An error occurred while creating the conversation",
      error: "Failed to create conversation",
    }
  }
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
): Promise<ChatActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: "Unauthorized access",
        error: "Unauthorized",
      }
    }

    await db.insert(messages).values({
      conversationId,
      role,
      content,
    })

    revalidateTag("messages")

    return { success: true, message: "Message saved successfully" }
  } catch (error) {
    console.error("Error saving message:", error)
    return {
      success: false,
      message: "An error occurred while saving the message",
      error: "Failed to save message",
    }
  }
}

export async function updateConversationTitle(
  id: string,
  title: string
): Promise<ConversationActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: "Unauthorized access",
        error: "Unauthorized",
      }
    }

    await db
      .update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(conversations.id, id))

    revalidateTag("conversations")

    return { success: true, message: "Conversation updated successfully" }
  } catch (error) {
    console.error("Error updating conversation:", error)
    return {
      success: false,
      message: "An error occurred while updating the conversation",
      error: "Failed to update conversation",
    }
  }
}

export async function deleteConversation(
  id: string
): Promise<ConversationActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: "Unauthorized access",
        error: "Unauthorized",
      }
    }

    await db.delete(conversations).where(eq(conversations.id, id))

    revalidateTag("conversations")

    return { success: true, message: "Conversation deleted successfully" }
  } catch (error) {
    console.error("Error deleting conversation:", error)
    return {
      success: false,
      message: "An error occurred while deleting the conversation",
      error: "Failed to delete conversation",
    }
  }
}
