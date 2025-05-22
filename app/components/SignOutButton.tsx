"use client"

import { LogOut } from "lucide-react"
import { useTransition } from "react"
import { signOut } from "@/app/actions/auth"
import { Button } from "./ui/button"

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition()

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <Button
      onClick={handleSignOut}
      disabled={isPending}
      variant="outline"
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      <span>{isPending ? "Signing out..." : "Sign Out"}</span>
    </Button>
  )
}
