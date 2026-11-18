import Link from "next/link"
import { BriefcaseBusiness, GraduationCap, Newspaper, Smartphone, Users } from "lucide-react"
import { Logo } from "@/components/brand/logo"

const LINKS = [
  { label: "Top Content", icon: Newspaper },
  { label: "People", icon: Users },
  { label: "Learning", icon: GraduationCap },
  { label: "Jobs", icon: BriefcaseBusiness },
  { label: "Get the app", icon: Smartphone },
]

export function GuestHeader() {
  return (
    <header className="mx-auto flex h-[72px] max-w-[1128px] items-center gap-2 px-4 lg:px-0">
      <Logo withWordmark />
      <nav aria-label="Explore" className="ml-auto hidden h-full items-stretch md:flex">
        {LINKS.map(({ label, icon: Icon }) => (
          <Link
            key={label}
            href="/login"
            className="flex w-[84px] flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icon className="size-6" strokeWidth={1.6} />
            {label}
          </Link>
        ))}
        <span className="mx-2 my-4 w-px bg-black/15" />
      </nav>
      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <Link href="/signup" className="flex h-12 items-center rounded-full px-5 text-base font-semibold text-subtle-foreground hover:bg-accent hover:text-foreground">
          Join now
        </Link>
        <Link
          href="/login"
          className="flex h-12 items-center rounded-full px-6 text-base font-semibold text-primary shadow-[inset_0_0_0_1px_var(--primary)] transition-[box-shadow,background-color] hover:bg-primary-soft hover:shadow-[inset_0_0_0_2px_var(--primary)]"
        >
          Sign in
        </Link>
      </div>
    </header>
  )
}
