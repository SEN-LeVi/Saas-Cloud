import "server-only"
import { Client } from "pg"

export type DbHealth =
  | { ok: true }
  | { ok: false; reason: "no_url" | "placeholder" | "unreachable" | "auth_failed" | "no_database" | "no_tables" | "unknown"; message: string }

/** Diagnoses the database connection without exposing the password. */
export async function checkDatabase(): Promise<DbHealth> {
  const url = process.env.DATABASE_URL
  if (!url) return { ok: false, reason: "no_url", message: "DATABASE_URL is not set. Add it to .env.local." }

  let target = "the database server"
  try {
    const u = new URL(url)
    target = `${u.hostname}:${u.port || "5432"}`
    if (decodeURIComponent(u.password) === "YOUR_DB_PASSWORD")
      return { ok: false, reason: "placeholder", message: "Replace YOUR_DB_PASSWORD in DATABASE_URL (in .env.local) with your PostgreSQL password, then restart the server." }
  } catch {
    return { ok: false, reason: "unknown", message: "DATABASE_URL isn't a valid PostgreSQL connection string." }
  }

  const client = new Client({ connectionString: url, connectionTimeoutMillis: 4000 })
  try {
    await client.connect()
    const { rows } = await client.query<{ t: string | null }>("select to_regclass('public.users')::text as t")
    if (!rows[0]?.t)
      return { ok: false, reason: "no_tables", message: "The database is reachable but its tables don't exist yet. Run `npm run setup` in the project folder." }
    return { ok: true }
  } catch (e) {
    const err = e as { code?: string }
    if (err.code === "28P01" || err.code === "28000")
      return { ok: false, reason: "auth_failed", message: "PostgreSQL rejected the username or password in DATABASE_URL (check .env and .env.local)." }
    if (err.code === "3D000")
      return { ok: false, reason: "no_database", message: "The database in DATABASE_URL doesn't exist yet. Run `npm run setup` to create it." }
    return {
      ok: false,
      reason: "unreachable",
      message: `Can't reach PostgreSQL at ${target}. Make sure the PostgreSQL service is running and the port in DATABASE_URL is right.`,
    }
  } finally {
    await client.end().catch(() => {})
  }
}
