"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Suspense, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  Grid3x3,
  House,
  LogOut,
  MessageSquareMore,
  Search,
  Sparkles,
  Users,
} from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMe } from "@/hooks/queries"
import { authClient } from "@/lib/auth-client"
import { CACHE_KEY } from "@/components/providers"
import { openAssistant } from "@/components/ai/assistant-store"
import { cn } from "@/lib/utils"

type NavKey = "invitations" | "unreadMessages" | "unreadNotifications"

const NAV: { href: string; label: string; icon: typeof House; badge?: NavKey }[] = [
  { href: "/feed", label: "Home", icon: House },
  { href: "/mynetwork", label: "My Network", icon: Users, badge: "invitations" },
  { href: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/messaging", label: "Messaging", icon: MessageSquareMore, badge: "unreadMessages" },
  { href: "/notifications", label: "Notifications", icon: Bell, badge: "unreadNotifications" },
]

export function TopNav() {
  const router = useRouter()
  const [q, setQ] = useState("")

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="mx-auto flex h-[52px] max-w-[1128px] items-center gap-2 px-3 lg:px-0">
        <Logo href="/feed" />

        <form
          role="search"
          className="relative hidden md:block"
          onSubmit={(e) => {
            e.preventDefault()
            if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`)
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            aria-label="Search people and jobs"
            className="h-[34px] w-[200px] rounded-[4px] bg-search pr-3 pl-10 text-sm outline-none placeholder:text-subtle-foreground transition-[width,box-shadow] duration-200 focus:w-[280px] focus:shadow-[inset_0_0_0_2px_rgb(0_0_0/0.9)] lg:w-[280px] lg:focus:w-[380px]"
          />
        </form>

        <nav aria-label="Primary" className="ml-auto flex h-full items-stretch">
          <Link
            href="/search"
            className="flex w-12 flex-col items-center justify-center text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Search"
          >
            <Search className="size-6" strokeWidth={1.75} />
          </Link>
          <Suspense fallback={<NavItems pathname={null} />}>
            <ActiveNavItems />
          </Suspense>
          <MeMenu />
          <div className="mx-1 my-2 hidden w-px bg-border lg:block" />
          <button
            type="button"
            className="hidden w-[92px] flex-col items-center justify-center whitespace-nowrap text-muted-foreground hover:text-foreground lg:flex"
            onClick={() => router.push("/jobs")}
          >
            <Grid3x3 className="size-6" strokeWidth={1.75} />
            <span className="flex items-center text-xs leading-4">
              For Business <ChevronDown className="size-3" />
            </span>
          </button>
          <button
            type="button"
            onClick={openAssistant}
            className="ml-1 hidden items-center gap-1 self-center rounded-sm px-1 text-xs leading-4 font-semibold text-rust underline-offset-2 hover:underline xl:flex"
          >
            <Sparkles className="size-4" /> Try Workvine AI
          </button>
        </nav>
      </div>
    </header>
  )
}

function MeMenu() {
  const { data: me } = useMe()
  const router = useRouter()
  const queryClient = useQueryClient()

  async function handleSignOut() {
    await authClient.signOut()
    queryClient.clear()
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch {}
    router.replace("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-12 flex-col items-center justify-center text-muted-foreground outline-none hover:text-foreground sm:w-16 lg:w-20">
        {me ? <UserAvatar user={me} size={24} /> : <span className="size-6 rounded-full bg-sand" />}
        <span className="hidden items-center text-xs leading-4 lg:flex">
          Me <ChevronDown className="size-3" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-lg p-0 shadow-float">
        {me && (
          <div className="p-3">
            <div className="flex gap-2">
              <UserAvatar user={me} size={56} />
              <div className="min-w-0">
                <p className="text-base font-semibold">{me.name}</p>
                <p className="line-clamp-2 text-sm text-foreground">{me.headline}</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <Link href={`/in/${me.handle}`}>View Profile</Link>
            </Button>
          </div>
        )}
        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuLabel className="px-3 pt-2 text-base font-semibold">Account</DropdownMenuLabel>
        <DropdownMenuItem className="mx-1 text-muted-foreground" onSelect={openAssistant}>
          <Sparkles /> Workvine AI assistant
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="mx-1 text-muted-foreground">
          <Link href="/jobs">Saved jobs</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="mx-1 mb-1 text-muted-foreground" onSelect={handleSignOut}>
          <LogOut /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Reads the URL (dynamic) — kept behind Suspense so every page shell can prerender. */
function ActiveNavItems() {
  return <NavItems pathname={usePathname()} />
}

function NavItems({ pathname }: { pathname: string | null }) {
  const { data: me } = useMe()
  return (
    <>
          {NAV.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname !== null && (pathname === href || pathname.startsWith(`${href}/`))
            const count = badge && me ? me.stats[badge] : 0
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex w-12 flex-col items-center justify-center text-muted-foreground transition-colors hover:text-foreground sm:w-16 lg:w-20",
                  active && "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground"
                )}
              >
                <span className="relative">
                  <Icon className="size-6" strokeWidth={active ? 2.25 : 1.75} fill={active && label === "Home" ? "currentColor" : "none"} />
                  {count > 0 && (
                    <span className="tabular absolute -top-1 -right-2 min-w-4 rounded-full bg-badge px-1 text-center text-[11px] leading-4 font-semibold text-white ring-2 ring-white">
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </span>
                <span className="hidden text-xs leading-4 lg:block">{label}</span>
              </Link>
            )
          })}
    </>
  )
}
