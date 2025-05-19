import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { createDocument } from "../../../lib/upload"
import { uuid } from "drizzle-orm/pg-core"

const f = createUploadthing()
const userId = uuid() // Fake user ID for demonstration
const auth = (req: Request) => ({ id: `${userId}` })

export const ourFileRouter = {
  fileUploader: f({
    blob: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req)
      if (!user) throw new UploadThingError("Unauthorized")
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const userId = metadata.userId
      createDocument(userId, file)
      console.log("Upload complete for userId:", userId)
      console.log("file url", file.ufsUrl)
      return { uploadedBy: userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
