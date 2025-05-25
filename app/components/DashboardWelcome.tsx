"use client"

import UploadButtonComponent from "@/app/components/upload-button"

export default function DashboardWelcome() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Welcome to DocChat
        </h2>
        <p className="text-muted-foreground">
          Upload documents and start chatting with them using AI
        </p>
      </div>
      <div className="flex items-center justify-between">
        <UploadButtonComponent />
      </div>
    </div>
  )
}
