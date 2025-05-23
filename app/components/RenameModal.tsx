import { useEffect, useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Button } from "./ui/button"

interface RenameModalProps {
  open: boolean
  title: string
  initialName: string
  onSubmit: (value: string) => void
  onCancel: () => void
}

export default function RenameModal({
  open,
  title,
  initialName,
  onSubmit,
  onCancel,
}: RenameModalProps) {
  const [value, setValue] = useState(initialName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setValue(initialName)
  }, [open, initialName])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-6 rounded-lg shadow-lg w-full max-w-sm">
          <Dialog.Title className="text-lg font-semibold mb-4">
            {title}
          </Dialog.Title>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (value.trim()) onSubmit(value.trim())
            }}
          >
            <input
              ref={inputRef}
              className="w-full border rounded px-3 py-2 mb-4"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter new name"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={!value.trim()}>
                Rename
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
