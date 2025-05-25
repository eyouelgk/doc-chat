"use client"

import { MoreHorizontal, FileText, Settings } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { ThemeToggle } from "@/app/components/theme-toggle"
import SignOutButton from "@/app/components/SignOutButton"
import { Button } from "@/app/components/ui/button"
import { useState } from "react"

export default function DashboardHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  return (
    <div>
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">DocChat</h1>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/user-profile"
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <SignOutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}
