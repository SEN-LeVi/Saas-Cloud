/**
 * Loads env files for CLI tools (Prisma, Drizzle, seed) the same way Next.js does:
 * values in .env.local win over .env. Next.js itself loads these automatically.
 */
import { config } from "dotenv"

config({ path: [".env.local", ".env"], quiet: true })
