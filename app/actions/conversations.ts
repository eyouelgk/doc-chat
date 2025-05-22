"use server"

import { initiateChatWithDocument } from "@/lib/chat"
// import { db } from "@/db"
// import { conversations, messages } from "@/db/schema"
// import { eq } from "drizzle-orm"
// import { getCurrentUser } from "@/lib/get-data"
// import { z } from "zod"
// import { revalidateTag } from "next/cache"
// import { redirect } from "next/navigation"
// import { cacheTag } from "next/dist/server/use-cache/cache-tag"

export type ChatActionResponse = {
  success: boolean
  message?: string
  aiResponse?: string
  error?: string
}

export async function sendMessageToAI(documentId: string, message: string) {
  const chain = await initiateChatWithDocument(documentId)
  if (!chain) {
    return { success: false, error: "Failed to initiate chat" }
  }
  try {
    if (!chain || !message) {
      return { success: false, error: "Missing document ID or message" }
    }
    const aiResponse = await chain.invoke(message)
    return { success: true, aiResponse }
  } catch (error) {
    console.error("AI chat error:", error)
    return { success: false, error: "Failed to get AI response" }
  }
}
// Define Zod schema for issue validation
// const ConversationSchema = z.object({
//   title: z
//     .string()
//     .min(3, "Title must be at least 3 characters")
//     .max(100, "Title must be less than 100 characters"),
//   description: z.string().optional().nullable(),
//   userId: z.string().min(1, "User ID is required"),
// })

// export type ConversationData = z.infer<typeof ConversationSchema>

// export type ActionResponse = {
//   success: boolean
//   message: string
//   errors?: Record<string, string[]>
//   error?: string
// }

// export async function createConversation(
//   data: ConversationData
// ): Promise<ActionResponse> {
//   try {
//     const user = await getCurrentUser()
//     if (!user) {
//       return {
//         success: false,
//         message: "Unauthorized access",
//         error: "Unauthorized",
//       }
//     }

//     // Validate with Zod
//     const validationResult = ConversationSchema.safeParse(data)
//     if (!validationResult.success) {
//       return {
//         success: false,
//         message: "Validation failed",
//         errors: validationResult.error.flatten().fieldErrors,
//       }
//     }

//     // Create conversation with validated data
//     const validatedData = validationResult.data
//     await db.insert(conversations).values({
//       title: validatedData.title,
//       userId: validatedData.userId,
//     })

//     revalidateTag("conversations")

//     return { success: true, message: "Conversation created successfully" }
//   } catch (error) {
//     console.error("Error creating conversation:", error)
//     return {
//       success: false,
//       message: "An error occurred while creating the conversation",
//       error: "Failed to create conversation",
//     }
//   }
// }

// export async function updateConversation(
//   id: string,
//   data: Partial<ConversationData>
// ): Promise<ActionResponse> {
//   try {
//     const user = await getCurrentUser()
//     if (!user) {
//       return {
//         success: false,
//         message: "Unauthorized access",
//         error: "Unauthorized",
//       }
//     }

//     // Allow partial validation for updates
//     const UpdateConversationSchema = ConversationSchema.partial()
//     const validationResult = UpdateConversationSchema.safeParse(data)

//     if (!validationResult.success) {
//       return {
//         success: false,
//         message: "Validation failed",
//         errors: validationResult.error.flatten().fieldErrors,
//       }
//     }

//     const validatedData = validationResult.data
//     const updateData: Record<string, unknown> = {}

//     if (validatedData.title !== undefined)
//       updateData.title = validatedData.title
//     if (validatedData.description !== undefined)
//       updateData.description = validatedData.description

//     await db
//       .update(conversations)
//       .set(updateData)
//       .where(eq(conversations.id, id))

//     return { success: true, message: "Conversation updated successfully" }
//   } catch (error) {
//     console.error("Error updating conversation:", error)
//     return {
//       success: false,
//       message: "An error occurred while updating the conversation",
//       error: "Failed to update conversation",
//     }
//   }
// }

// export async function deleteConversation(id: string): Promise<ActionResponse> {
//   try {
//     const user = await getCurrentUser()
//     if (!user) {
//       throw new Error("Unauthorized")
//     }

//     // Delete conversation
//     await db.delete(conversations).where(eq(conversations.id, id))

//     return { success: true, message: "Conversation deleted successfully" }
//   } catch (error) {
//     console.error("Error deleting conversation:", error)
//     return {
//       success: false,
//       message: "An error occurred while deleting the conversation",
//       error: "Failed to delete conversation",
//     }
//   }
// }
