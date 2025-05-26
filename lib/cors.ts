// Utility to add CORS headers to all API responses
export function withCORS(response: Response, origin = "*") {
  response.headers.set("Access-Control-Allow-Origin", origin)
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  )
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  )
  response.headers.set("Access-Control-Allow-Credentials", "true")
  return response
}
