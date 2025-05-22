"use client"

import { UploadButton } from "@/lib/uploadthing"
import { Button } from "@/app/components/ui/button"
import { Upload } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"

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
        // Refresh the page to show the new document
        window.location.reload()
      }}
      onUploadError={(error: Error) => {
        setIsUploading(false)
        toast.error(`Upload failed: ${error.message}`)
      }}
      content={{
        allowedContent({ ready, fileTypes, isUploading }) {
          if (!ready) return "Checking..."
          if (isUploading) return "Uploading..."
          return `PDF, DOCX, TXT (up to 16MB)`
        },
      }}
    />
  )
}
