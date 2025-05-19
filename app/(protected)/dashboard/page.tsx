"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "../../components/ui/button"
import { formatRelativeTime } from "@/lib/utils"
import UploadButtonComponent from "@/app/components/upload-button"
import SignOutButton from "../../components/SignOutButton"

export default function DashboardPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDocuments() {
      setLoading(true)
      const res = await fetch("/api/documents")
      if (res.ok) {
        const data = await res.json()
        setDocuments(data.documents)
      }
      setLoading(false)
    }
    fetchDocuments()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mr-4 ml-4 mb-4 mt-2">
        <h1 className="text-2xl font-bold">DocuChat</h1>
        <div className="flex items-center gap-2">
          <SignOutButton />
        </div>
        <div className="fixed bottom-16 right-24 z-50">
          <UploadButtonComponent />
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : documents.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-high shadow-sm">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-elevated border-b border-gray-200 dark:border-dark-border-default">
            <div className="col-span-5">File Name</div>
            <div className="col-span-3">Created</div>
            <div className="col-span-4"> </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-dark-border-default">
            {documents.map((document) => (
              <div
                key={document.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
              >
                <div className="col-span-5 font-medium truncate">
                  {document.fileName}
                </div>
                <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(new Date(document.createdAt))}
                </div>
                <div className="col-span-4 flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/chat/${document.id}`}>Start Chat</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-gray-200 dark:border-dark-border-default rounded-lg bg-white dark:bg-dark-high p-8">
          <h3 className="text-lg font-medium mb-2">No documents found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Get started by uploading a document.
          </p>
          <UploadButtonComponent />
        </div>
      )}
    </div>
  )
}
