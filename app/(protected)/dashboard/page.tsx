"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "../../components/ui/button"
import { formatRelativeTime } from "@/lib/utils"
import UploadButtonComponent from "@/app/components/upload-button"
import SignOutButton from "../../components/SignOutButton"
import {
  MoreHorizontal,
  Pencil,
  Replace,
  Trash,
  FileText,
  MessageSquare,
  Plus,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function DashboardPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const handleRenameDocument = (id: string) => {
    // This will be implemented with a modal in a future update
    console.log("Rename document:", id)
    // For now, just show a toast
    toast.info("Rename functionality will be available soon")
  }

  const handleReplaceDocument = (id: string) => {
    // This will be implemented with the upload component in a future update
    console.log("Replace document:", id)
    // For now, just show a toast
    toast.info("Replace functionality will be available soon")
  }

  const handleDeleteDocument = async (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        const res = await fetch(`/api/documents/${id}`, {
          method: "DELETE",
        })

        if (res.ok) {
          toast.success("Document deleted successfully")
          // Refresh the documents list
          setDocuments(documents.filter((doc) => doc.id !== id))
        } else {
          toast.error("Failed to delete document")
        }
      } catch (error) {
        console.error("Error deleting document:", error)
        toast.error("An error occurred while deleting the document")
      }
    }
  }

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
      <AppHeader />
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : documents.length > 0 ? (
        <div className="bg-white dark:bg-dark-high rounded-xl border border-gray-200 dark:border-dark-border-default shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-elevated border-b border-gray-200 dark:border-dark-border-default">
            <div className="col-span-5">File Name</div>
            <div className="col-span-3">Created</div>
            <div className="col-span-4 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-dark-border-default">
            {documents.map((document) => (
              <div
                key={document.id}
                className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
              >
                <div className="col-span-5 font-medium truncate flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  {document.fileName}
                </div>
                <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(new Date(document.createdAt))}
                </div>
                <div className="col-span-4 flex justify-end gap-3">
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/chat/${document.id}`}
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat with Document
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRenameDocument(document.id)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleReplaceDocument(document.id)}
                      >
                        <Replace className="mr-2 h-4 w-4" />
                        <span>Replace</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDeleteDocument(document.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-gray-200 dark:border-dark-border-default rounded-xl bg-white dark:bg-dark-high p-8">
          <div className="bg-primary/10 rounded-full p-4 mb-4">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">No documents found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
            Upload a document to get started. You can chat with your documents
            and get insights from them.
          </p>
          <UploadButtonComponent />
        </div>
      )}

      {documents.length > 0 && (
        <div className="fixed bottom-8 right-8 z-50">
          <UploadButtonComponent />
        </div>
      )}
    </div>
  )
}

function AppHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="flex items-center justify-between mb-8 relative">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        DocuChat
      </h1>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="inline-flex items-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-dark-high text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50"
        >
          Menu
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-high border border-gray-200 dark:border-dark-border-default rounded-md shadow-lg">
            <Link
              href="/user-profile"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-elevated"
            >
              Profile
            </Link>
            <SignOutButton />
          </div>
        )}
      </div>
    </header>
  )
}
