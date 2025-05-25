"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "../../components/ui/button"
import { formatRelativeTime } from "@/lib/utils"
import { MoreHorizontal, Pencil, Trash, FileText } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { toast } from "sonner"
import DashboardHeader from "@/app/components/DashboardHeader"
import RenameModal from "@/app/components/RenameModal"
import ConfirmDialog from "@/app/components/ConfirmDialog"
import UploadDropzoneComponent from "@/app/components/drop-zone"
import DocumentsSkeleton from "@/app/components/DocumentSkeleton"
import DashboardWelcome from "@/app/components/DashboardWelcome"
interface Document {
  id: string
  fileName: string
  createdAt: string
  fileSize?: number
}
export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [renameModal, setRenameModal] = useState<{
    open: boolean
    docId: string | null
    initialName: string
    resolve?: (value: string | null) => void
  }>({ open: false, docId: null, initialName: "" })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    docId: string | null
  }>({ open: false, docId: null })
  const handleRenameDocument = async (id: string) => {
    const doc = documents.find((d) => d.id === id)
    if (!doc) return
    const newName = await new Promise<string | null>((resolve) => {
      setRenameModal({
        open: true,
        docId: id,
        initialName: doc.fileName,
        resolve,
      })
    })
    setRenameModal((m) => ({ ...m, open: false }))
    if (newName && newName !== doc.fileName) {
      try {
        const res = await fetch(`/api/documents/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: newName }),
        })
        if (res.ok) {
          toast.success("Document renamed successfully")
          setDocuments((prevDocs) =>
            prevDocs.map((doc) =>
              doc.id === id ? { ...doc, fileName: newName } : doc
            )
          )
        } else {
          toast.error("Failed to rename document")
        }
      } catch (error) {
        console.error("Error renaming document:", error)
        toast.error("An error occurred while renaming the document")
      }
    }
  }
  const handleDeleteDocument = (id: string) => {
    setDeleteDialog({ open: true, docId: id })
  }
  const confirmDeleteDocument = async () => {
    if (!deleteDialog.docId) return
    try {
      const res = await fetch(`/api/documents/${deleteDialog.docId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Document deleted successfully")
        setDocuments((docs) =>
          docs.filter((doc) => doc.id !== deleteDialog.docId)
        )
      } else {
        toast.error("Failed to delete document")
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      toast.error("An error occurred while deleting the document")
    } finally {
      setDeleteDialog({ open: false, docId: null })
    }
  }
  useEffect(() => {
    async function fetchDocuments() {
      setLoading(true)
      try {
        const res = await fetch("/api/documents")
        if (res.ok) {
          const data = await res.json()
          setDocuments(data.documents)
        }
      } catch (error) {
        console.error("Error fetching documents:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDocuments()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-6 py-8">
        <DashboardWelcome />
        {loading ? (
          <DocumentsSkeleton />
        ) : documents.length > 0 ? (
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-muted-foreground bg-muted/50 border-b border-border">
                <div className="col-span-5">Title</div>
                <div className="col-span-3">Uploaded</div>
                <div className="col-span-4 text-right">Actions</div>
              </div>

              <div className="divide-y divide-border">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/50 transition-colors"
                  >
                    <div className="col-span-5 flex items-center gap-3 font-medium truncate">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                        <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <Link
                        href={`/chat/${document.id}`}
                        className="text-foreground truncate"
                      >
                        {document.fileName}
                      </Link>
                    </div>
                    <div className="col-span-3 text-sm text-muted-foreground">
                      {formatRelativeTime(new Date(document.createdAt))}
                    </div>
                    <div className="col-span-4 flex justify-end gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteDocument(document.id)}
                            className="text-destructive focus:text-destructive"
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
          </div>
        ) : (
          <UploadDropzoneComponent />
        )}
      </main>
      <RenameModal
        open={renameModal.open}
        title="Rename Document"
        initialName={renameModal.initialName}
        onSubmit={(value) => {
          renameModal.resolve?.(value)
          setRenameModal((m) => ({ ...m, open: false }))
        }}
        onCancel={() => {
          renameModal.resolve?.(null)
          setRenameModal((m) => ({ ...m, open: false }))
        }}
      />
      <ConfirmDialog
        open={deleteDialog.open}
        onConfirm={confirmDeleteDocument}
        onCancel={() => setDeleteDialog({ open: false, docId: null })}
      />
    </div>
  )
}
