"use client"

import * as React from "react"
import { IconInnerShadowTop } from "@tabler/icons-react"
import { NavMain } from "@/app/components/nav-main"
import { NavUser } from "@/app/components/nav-user"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/components/ui/sidebar"

function useUserData() {
  const { data: session } = useSession()
  type Document = {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    fileName: string
    filePath: string
  }
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    async function fetchDocs() {
      if (!session?.user?.email) return
      try {
        const response = await fetch(
          `/api/documents?email=${session.user.email}`
        )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: Document[] = await response.json()
        setDocuments(data)
      } catch (error) {
        console.error("Failed to fetch documents", error)
      }
    }
    if (session?.user?.email) {
      fetchDocs()
    }
  }, [session?.user?.email])

  return {
    user: {
      name: session?.user?.name ?? "Guest",
      email: session?.user?.email ?? "",
    },
    documents,
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">DocuChat</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {(() => {
        const data = useUserData()
        return (
          <>
            <SidebarContent>
              <NavMain documents={data.documents} />
            </SidebarContent>
            <SidebarFooter>
              <NavUser user={data.user} />
            </SidebarFooter>
          </>
        )
      })()}
    </Sidebar>
  )
}
