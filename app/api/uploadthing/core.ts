import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { createDocument } from "../../../lib/create-data"
import { getCurrentUser } from "@/lib/get-data"
const f = createUploadthing()

export const ourFileRouter = {
  fileUploader: f({
    "application/pdf": { maxFileSize: "16MB" },
    "application/msword": { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
    },

    text: { maxFileSize: "16MB" },
  })
    .middleware(async ({ req }) => {
      const user = await getCurrentUser()
      if (!user) throw new UploadThingError("Unauthorized")
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const userId = metadata.userId
      await createDocument(userId, file)
      console.log("Upload complete for userId:", userId)
      console.log("file url", file.ufsUrl)
      return { uploadedBy: userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
