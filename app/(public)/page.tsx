"use client"

import Link from "next/link"

export default function Home() {
  return (
    <div>
      <h1>Welcome to DocuChat!</h1>
      <Link href="/login">Sign In</Link>
      <br />
      <Link href="/signup">Sign Up</Link>
      <br />
    </div>
  )
}
