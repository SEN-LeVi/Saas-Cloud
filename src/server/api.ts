import "server-only"
import { NextResponse } from "next/server"
import { unstable_rethrow } from "next/navigation"
import { z, type ZodType } from "zod"
import { auth } from "@/lib/auth"

export type AuthedUser = { id: string; name: string; email: string; handle: string }

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}

export async function requireUser(req: Request): Promise<AuthedUser> {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) throw new HttpError(401, "Please sign in to continue.")
  const u = session.user as typeof session.user & { handle?: string }
  return { id: u.id, name: u.name, email: u.email, handle: u.handle ?? "" }
}

export async function parseJson<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.")
  }
  const result = schema.safeParse(body)
  if (!result.success) throw new HttpError(422, z.prettifyError(result.error))
  return result.data
}

export function parseQuery<T>(req: Request, schema: ZodType<T>): T {
  const params = Object.fromEntries(new URL(req.url).searchParams)
  const result = schema.safeParse(params)
  if (!result.success) throw new HttpError(422, z.prettifyError(result.error))
  return result.data
}

type Ctx<P> = { params: Promise<P> }

/** Wraps a route handler: resolves the user, converts thrown errors into JSON responses. */
export function route<P = Record<string, string>>(
  handler: (req: Request, ctx: { user: AuthedUser; params: P }) => Promise<unknown>
) {
  return async (req: Request, ctx: Ctx<P>) => {
    try {
      const user = await requireUser(req)
      const params = ctx?.params ? await ctx.params : ({} as P)
      const data = await handler(req, { user, params })
      if (data instanceof Response) return data
      return NextResponse.json(data ?? { ok: true })
    } catch (err) {
      // Let Next.js handle its own control-flow signals (dynamic bail-out, redirects…).
      unstable_rethrow(err)
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message }, { status: err.status })
      }
      console.error(err)
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
    }
  }
}
