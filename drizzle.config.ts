import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";


dotenv.config({
    path: `${process.env.NODE_ENV || 'development'}.env`
});

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set.");
}

export default defineConfig({
    schema: "./db/schema.ts",
    out: "./db/drizzle",
    dialect: 'postgresql',
    dbCredentials: {
        url: databaseUrl
    }
});