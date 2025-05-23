"use client"

import { LogOut } from "lucide-react"
import { useTransition } from "react"
import { signOut } from "@/app/actions/auth"
import { DropdownMenuItem } from "@/app/components/ui/dropdown-menu"

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition()

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <DropdownMenuItem onClick={handleSignOut} disabled={isPending}>
      <LogOut className="mr-2 h-4 w-4" />
      <span>{isPending ? "Signing out..." : "Sign Out"}</span>
    </DropdownMenuItem>
  )
}
