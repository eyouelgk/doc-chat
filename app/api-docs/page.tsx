import React from "react"

export default function ApiDocsPage() {
  return (
    <iframe
      src="https://petstore.swagger.io/?url=/api-docs/openapi.json"
      style={{ width: "100vw", height: "100vh", border: "none" }}
      title="Swagger UI"
    />
  )
}
