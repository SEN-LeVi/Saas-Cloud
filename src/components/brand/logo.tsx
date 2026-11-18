import Link from "next/link"
import { cn } from "@/lib/utils"

/** Workvine mark: a "W" drawn as a single vine stroke with one leaf. Original artwork. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 34" className={cn("size-[34px]", className)} role="img" aria-label="Workvine">
      <rect width="34" height="34" rx="6" fill="var(--primary)" />
      <path
        d="M7.5 11.5 11.3 23l4.2-8.6 4.2 8.6 3.8-11.5"
        stroke="#fff"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M23.6 11.3c1.6-2.7 4.2-3.3 5.4-2.9-.1 2-1.9 3.8-5.4 2.9Z" fill="#fff" />
    </svg>
  )
}

export function Logo({ withWordmark = false, href = "/", className }: { withWordmark?: boolean; href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex shrink-0 items-center gap-1.5 rounded-sm", className)} aria-label="Workvine home">
      {withWordmark && (
        <span className="text-[28px] leading-none font-bold tracking-[-0.03em] text-primary">Workvine</span>
      )}
      <LogoMark className={withWordmark ? "size-[30px]" : undefined} />
    </Link>
  )
}
