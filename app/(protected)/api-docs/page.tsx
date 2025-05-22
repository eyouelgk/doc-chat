"use client"

// import { useEffect, useState } from "react"
// import SwaggerUI from "swagger-ui-react"
// import "swagger-ui-react/swagger-ui.css"

// export default function ApiDocsPage() {
//   const [spec, setSpec] = useState(null)

//   useEffect(() => {
//     fetch("/api/swagger.json")
//       .then((response) => response.json())
//       .then((data) => setSpec(data))
//       .catch((error) => console.error("Error loading API spec:", error))
//   }, [])

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold mb-6">DocuChat API Documentation</h1>
//       {spec ? (
//         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
//           <SwaggerUI spec={spec} />
//         </div>
//       ) : (
//         <div className="flex justify-center p-8">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//         </div>
//       )}
//     </div>
//   )
// }

export default function ApiDocsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">DocuChat API Documentation</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <iframe src="/api/swagger.json" width="100%" height="600px"></iframe>
      </div>
    </div>
  )
}
