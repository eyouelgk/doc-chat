"use client"

import { UploadButton } from "@/lib/uploadthing"

export default function UploadButtonComponent() {
  return (
    <div>
      <UploadButton
        endpoint="fileUploader"
        className="w-full"
        onClientUploadComplete={(res) => {
          console.log("Files: ", res)
        }}
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`)
        }}
      />
    </div>
  )
}
