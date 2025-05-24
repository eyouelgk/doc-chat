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
          if (ready) return "Upload"
          return "Getting ready..."
        },
        allowedContent({ ready, fileTypes, isUploading }) {
          if (!ready) return "Checking..."
          if (isUploading) return "Uploading..."
          return `PDF, DOCX, TXT (up to 15MB)`
        },
      }}
      appearance={{
        button:
          "px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2" +
          " " +
          "hover:opacity-90 ut-uploading:cursor-not-allowed " +
          " " +
          "ut-ready:bg-[var(--foreground)]  text-[var(--background)] ut-readying:bg-zinc-950/10  ut-uploading:bg-zinc-950/50 ut-uploading:after:bg-[var(--foreground)]/90  after:bg-[var(--background)]" +
          " " +
          "dark:text-[var(--background)] dark:ut-ready:bg-[var(--foreground)] dark:ut-uploading:bg-[var(--foreground)]/50 dark:ut-uploading:after:bg-[var(--background)]/90 dark:ut-uploading:text-red-500",
        allowedContent: "text-xs text-muted-foreground mt-2",
      }}
    />
  )
}
