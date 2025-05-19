"use client"

import Link from "next/link"
// import { UploadButton } from "@/lib/uploadthing"
export default function Home() {
  return (
    <div>
      <h1>Welcome to DocuChat!</h1>
      <Link href="/login">Sign In</Link>
      <br />
      <Link href="/signup">Sign Up</Link>
      <br />
      <Link href="/dashboard">Dashboard</Link>
    </div>
  )
}
