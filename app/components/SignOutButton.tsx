"use client"

import { LogOut } from "lucide-react"
import { useTransition } from "react"
import { signOut } from "@/app/actions/auth"

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition()

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-elevated"
    >
      <div className="flex items-center gap-2">
        <LogOut className="h-4 w-4" />
        <span>{isPending ? "Signing out..." : "Sign Out"}</span>
      </div>
    </button>
  )
}
