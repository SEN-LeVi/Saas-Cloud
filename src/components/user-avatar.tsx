import { cn } from "@/lib/utils"

const TONES = [
  ["#dce6f1", "#0a4a8a"],
  ["#e6e2d8", "#6b4f1d"],
  ["#dfeadf", "#2f5a2f"],
  ["#efe0db", "#8a3a1e"],
  ["#e5e0ee", "#4b3a7a"],
  ["#dbe9ec", "#1f5966"],
] as const

function tone(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return TONES[h % TONES.length]
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase()
}

/** Member photo, or initials on a soft tone derived from the member id. */
export function UserAvatar({
  user,
  size = 48,
  className,
  ring = false,
}: {
  user: { id: string; name: string; image?: string | null }
  size?: number
  className?: string
  ring?: boolean
}) {
  const [bg, fg] = tone(user.id)
  const style = { width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.38)) }
  if (user.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt={user.name}
        loading="lazy"
        decoding="async"
        style={style}
        className={cn("shrink-0 rounded-full object-cover", ring && "ring-4 ring-white", className)}
      />
    )
  }
  return (
    <span
      role="img"
      aria-label={user.name}
      style={{ ...style, background: bg, color: fg }}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none", ring && "ring-4 ring-white", className)}
    >
      {initials(user.name)}
    </span>
  )
}

/** Square company logo tile built from the company's brand color. */
export function CompanyLogo({ name, color, size = 48, className }: { name: string; color: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, background: color, fontSize: Math.round(size * 0.42) }}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-[4px] font-bold text-white", className)}
    >
      {name.replace(/[^A-Za-z]/g, "")[0] ?? "C"}
    </span>
  )
}
