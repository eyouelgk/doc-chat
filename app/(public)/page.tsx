"use client"

import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { FileText, MessageSquare, User } from "lucide-react"
import { ThemeToggle } from "@/app/components/theme-toggle"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">DocuChat</h1>
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Chat with your documents
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
              Upload your documents and get instant insights through natural
              conversation.
            </p>
            <Button asChild size="lg" className="px-8">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-12">
              How it works
            </h3>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Upload Documents</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload your PDFs, DOCXs, or text files to our secure platform.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Ask Questions</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Chat with your documents using natural language questions.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Get Insights</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Receive accurate answers and insights based on your document
                  content.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} DocuChat. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
