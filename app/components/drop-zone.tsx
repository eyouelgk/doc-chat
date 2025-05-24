"use client"

import { UploadDropzone } from "@/lib/uploadthing"
import { useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"

export default function UploadDropzoneComponent() {
  const [isUploading, setIsUploading] = useState(false)

  return (
    <UploadDropzone
      endpoint="fileUploader"
      onUploadBegin={() => {
        setIsUploading(true)
      }}
      onClientUploadComplete={(res) => {
        setIsUploading(false)
        toast.success("Document uploaded successfully!")
        window.location.reload()
      }}
      onUploadError={(error: Error) => {
        setIsUploading(false)
        toast.error(`Upload failed: ${error.message}`)
      }}
      config={{ mode: "auto" }}
      content={{
        label({ ready }) {
          if (ready)
            return (
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                No documents found
              </h3>
            )
          return "Getting ready..."
        },
        uploadIcon({ ready }) {
          if (ready) return <Plus className="h-12 w-12 text-muted-foreground" />
        },
        button({ ready, isUploading }) {
          if (isUploading) return "Uploading..."
          if (ready) return "Upload"
          return "Getting ready..."
        },
        allowedContent({ ready, fileTypes, isUploading }) {
          if (!ready) return "Checking..."
          if (isUploading) return "Uploading..."
          return (
            <p className="text-muted-foreground mb-8 max-w-md">
              Supported formats are PDF, DOCX, and TXT (up to 15MB).
            </p>
          )
        },
      }}
      appearance={{
        label: "Upload a document",
        button:
          "px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2" +
          " " +
          "hover:opacity-90" +
          " " +
          "bg-[var(--foreground)] text-[var(--background)] ut-button:data-[state=uploading]:bg-[var(--foreground)]" +
          " " +
          "dark:bg-[var(--foreground)] dark:text-[var(--background)]  dark:ut-button:data-[state=uploading]:bg-[var(--foreground)]",
        allowedContent: "text-xs text-muted-foreground mt-2",
      }}
    />
  )
}
