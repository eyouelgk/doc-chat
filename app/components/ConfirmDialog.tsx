"use client"

import { Button } from "./ui/button"

interface ConfirmDialogProps {
  open: boolean
  title?: string
  description?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title = "Delete Document",
  description = "Are you sure you want to delete this document? This action cannot be undone.",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg w-full max-w-sm p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="mb-6 text-sm text-muted-foreground">{description}</div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
