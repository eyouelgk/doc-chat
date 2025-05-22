import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import https from "https"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(date: Date): React.ReactNode {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return "just now"
  if (diff < 3600) {
    const mins = Math.floor(diff / 60)
    return `${mins} minute${mins !== 1 ? "s" : ""} ago`
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600)
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`
  }
  if (diff < 604800) {
    const days = Math.floor(diff / 86400)
    return `${days} day${days !== 1 ? "s" : ""} ago`
  }
  // fallback to date string
  return date.toLocaleDateString()
}

// export async function readRemoteFile(url: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     https
//       .get(url, (res) => {
//         let data = ""
//         res.on("data", (chunk) => (data += chunk))
//         res.on("end", () => {
//           console.log("File contents:", data)
//           resolve(data)
//         })
//       })
//       .on("error", (err) => {
//         console.error("Error fetching file:", err.message)
//         reject(err)
//       })
//   })
// }
