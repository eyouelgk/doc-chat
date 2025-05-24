import { drizzle as drizzleNeon } from "drizzle-orm/neon-http"
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres"
import { neon } from "@neondatabase/serverless"

import * as schema from "./schema"

export const db = process.env.VERCEL
  ? drizzleNeon({
      client: neon(process.env.DATABASE_URL!),
      schema,
      casing: "snake_case",
    })
  : drizzlePostgres(process.env.DATABASE_URL!, { schema, casing: "snake_case" })

// db/index.ts for supabase
// import { drizzle } from "drizzle-orm/postgres-js"
// import postgres from "postgres"
// import * as schema from "./schema"

// const connectionString = process.env.DATABASE_URL!

// const client = postgres(connectionString, { ssl: "allow", prepare: false })
// export const db = drizzle(client, { schema, casing: "snake_case" })
