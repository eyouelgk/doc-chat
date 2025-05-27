// non auth db data creation functions

import { db } from "@/db"
import { documents } from "@/db/schema"
import { z } from "zod"
import { revalidateTag } from "next/cache"
import { InsertDocument } from "./types"

const documentSchema = z.object({
  userId: z.string().min(1),
  file: z.object({
    key: z.string(),
    name: z.string(),
  }),
})

export async function createDocument(
  userId: string,
  file: object
): Promise<InsertDocument> {
  const parsedInput = documentSchema.parse({ userId, file })
  const { key: fileKey, name: fileName }: { key: string; name: string } =
    parsedInput.file
  const filePath = process.env.UPLOADTHING_URL + fileKey

  try {
    const result = await db
      .insert(documents)
      .values({
        userId,
        fileName,
        filePath,
      })
      .returning()
    const [document] = result
    revalidateTag("documents")
    return document
  } catch (error) {
    console.error("Error creating document:", error)
    throw new Error("Failed to create document")
  }
}
