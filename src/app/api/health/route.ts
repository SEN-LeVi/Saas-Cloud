import { connection, NextResponse } from "next/server"
import { checkDatabase } from "@/server/db-health"

// Public on purpose: lets the sign-in page explain database problems. Reveals no secrets.
export async function GET() {
  await connection()
  const db = await checkDatabase()
  return NextResponse.json({ database: db }, { status: db.ok ? 200 : 503 })
}
