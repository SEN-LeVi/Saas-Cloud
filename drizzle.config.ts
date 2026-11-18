import "./src/lib/load-env"
import { defineConfig } from "drizzle-kit"

// Prisma owns migrations. Drizzle reads the same database:
//  - `npm run drizzle:studio` to browse data
//  - `npm run drizzle:check`  to confirm the Drizzle mirror matches the DB (dry run)
export default defineConfig({
  schema: "./src/db/drizzle/schema.ts",
  out: "./src/db/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
  verbose: true,
})
