import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { createDocument, createDocumentChunks } from "@/lib/create-data"
import { getCurrentUser } from "@/lib/get-data"
import {
  embeddings,
  parseDocumentFromUrl,
  splitText,
} from "@/lib/doc-processing"

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
      let document // Declare document outside try block
      try {
        document = await createDocument(userId, file)
        console.log(
          "Document entry created for userId:",
          userId,
          "documentId:",
          document.id
        )
        console.log("file url", file.ufsUrl)
      } catch (error) {
        console.error("Error creating document entry:", error)
        // Stop further processing if document creation fails
        // Optionally, rethrow or return a specific error structure if your framework expects it
        return { error: "Failed to create document record" }
      }

      // Ensure document and document.id exist before proceeding
      // This check is important because even if createDocument doesn't throw,
      // it might (in some hypothetical scenario) return without a proper id.
      if (!document || !document.id) {
        console.error(
          "Document creation succeeded but document or document ID is undefined."
        )
        return { error: "Failed to obtain valid document ID after creation." }
      }

      try {
        const documentContent = await parseDocumentFromUrl(file.ufsUrl)
        const chunks = await splitText(documentContent)

        const chunkDataToStore = []
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i]
          const vector = await embeddings.embedQuery(chunk.pageContent)
          chunkDataToStore.push({
            // documentId: document.id, // This was already in the object, ensure it's correct
            chunkText: chunk.pageContent,
            chunkIndex: i,
            embedding: vector,
          })
        }

        if (chunkDataToStore.length > 0) {
          if (!document.id) {
            throw new Error("Document ID is undefined")
          }
          // Pass document.id separately if your createDocumentChunks expects it as a first arg
          await createDocumentChunks(
            document.id,
            chunkDataToStore.map((cd) => ({ ...cd, documentId: document.id }))
          )
          console.log(
            `Stored ${chunkDataToStore.length} chunks for documentId: ${document.id}`
          )
        }
      } catch (error) {
        console.error("Error processing document for vector storage:", error)
        // Optionally, handle this error, e.g., by deleting the main document entry if chunks fail
      }

      return { uploadedBy: userId, documentId: document.id }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
