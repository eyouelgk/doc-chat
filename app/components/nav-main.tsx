"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"

import { Button } from "../components/ui/button"
import { useEffect, useState } from "react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/components/ui/sidebar"

type Document = {
  id: string
  createdAt: Date
  updatedAt: Date
  userId: string
  fileName: string
  filePath: string
}

interface NavMainProps {
  documents: Document[]
}

export function NavMain({ documents }: NavMainProps) {
  const [loading, setLoading] = useState(true)

  // useEffect(() => {
  //   // Replace this fetch with your actual API endpoint
  //   fetch("/api/documents")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setDocuments(data)
  //       setLoading(false)
  //     })
  //     .catch(() => setLoading(false))
  // }, [])

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="upload Document"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Upload Document</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {loading ? (
            <SidebarMenuItem>
              <span>Loading...</span>
            </SidebarMenuItem>
          ) : documents.length === 0 ? (
            <SidebarMenuItem>
              <span>No documents found</span>
            </SidebarMenuItem>
          ) : (
            documents.map((doc) => (
              <SidebarMenuItem key={doc.id}>
                <SidebarMenuButton tooltip={doc.fileName}>
                  <IconMail />
                  <span>{doc.fileName}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
