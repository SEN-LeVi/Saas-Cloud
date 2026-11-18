import "server-only"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const globalForDrizzle = globalThis as unknown as { pgPool?: Pool }

const pool =
  globalForDrizzle.pgPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })

if (process.env.NODE_ENV !== "production") globalForDrizzle.pgPool = pool

export const db = drizzle(pool, { schema })
export { schema }
