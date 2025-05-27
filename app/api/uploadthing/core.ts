import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { createDocument } from "@/lib/create-data"
import { getCurrentUser } from "@/lib/get-data"
import { generateVectorStore } from "@/lib/vector-store"

const f = createUploadthing()

export const ourFileRouter = {
  fileUploader: f({
    "application/pdf": { maxFileSize: "16MB" },
    "application/msword": { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
    },
    "text/markdown": { maxFileSize: "16MB" },
    "text/plain": { maxFileSize: "16MB" },
    "text/html": { maxFileSize: "16MB" },

    text: { maxFileSize: "16MB" },
  })
    .middleware(async ({ req }) => {
      const user = await getCurrentUser()
      if (!user) throw new UploadThingError("Unauthorized")
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const userId = metadata.userId
      try {
        const document = await createDocument(userId, file)
        await generateVectorStore(document.id!, file.ufsUrl)
        return { uploadedBy: userId, documentId: document.id! }
      } catch (error) {
        return { error: "Failed to create document record" }
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
