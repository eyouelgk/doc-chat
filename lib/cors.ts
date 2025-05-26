// Utility to add CORS headers to all API responses
export function withCORS(
  response: Response | { json: Function },
  origin = "*"
) {
  if (response instanceof Response) {
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
  // For NextResponse.json()
  return (body: any, init: any = {}) => {
    init.headers = {
      ...(init.headers || {}),
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    }
    return response.json(body, init)
  }
}
