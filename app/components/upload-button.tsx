"use client"

import { UploadButton } from "@/lib/uploadthing"
import { useState } from "react"
import { toast } from "sonner"

export default function UploadButtonComponent() {
  const [isUploading, setIsUploading] = useState(false)

  return (
    <UploadButton
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
      content={{
        button({ ready, isUploading }) {
          if (isUploading) return "Uploading..."
          if (ready) return "Upload Document"
          return "Getting ready..."
        },
        allowedContent({ ready, fileTypes, isUploading }) {
          if (!ready) return "Checking..."
          if (isUploading) return "Uploading..."
          return `PDF, DOCX, TXT (up to 16MB)`
        },
      }}
      appearance={{
        button:
          "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2",
        allowedContent: "text-xs text-muted-foreground mt-2",
      }}
    />
  )
}
