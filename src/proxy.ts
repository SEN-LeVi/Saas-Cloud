import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

const APP_ROUTES = ["/feed", "/mynetwork", "/jobs", "/messaging", "/notifications", "/in", "/search"]
const AUTH_ROUTES = ["/login", "/signup"]

// Optimistic check only (cookie presence). Every API route re-validates the session.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(getSessionCookie(request))

  const isApp = APP_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))
  if (isApp && !hasSession) {
    const url = new URL("/login", request.url)
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  if ((pathname === "/" || AUTH_ROUTES.includes(pathname)) && hasSession) {
    return NextResponse.redirect(new URL("/feed", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp|ico)$).*)"],
}
