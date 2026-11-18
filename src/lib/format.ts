const UNITS: [number, string][] = [
  [60, "s"],
  [60, "m"],
  [24, "h"],
  [7, "d"],
  [4.345, "w"],
  [12, "mo"],
  [Number.POSITIVE_INFINITY, "yr"],
]

/** Compact relative time like the reference feed: 3h, 2d, 1w. */
export function timeAgo(iso: string, now = Date.now()) {
  let diff = Math.max(0, (now - new Date(iso).getTime()) / 1000)
  for (const [step, unit] of UNITS) {
    if (diff < step) return `${Math.max(1, Math.floor(diff))}${unit}`
    diff /= step
  }
  return ""
}

export function compactNumber(n: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n)
}

export function monthYear(iso: string) {
  return new Date(iso).toLocaleDateString("en", { month: "short", year: "numeric" })
}

export const WORKPLACE_LABEL = { ON_SITE: "On-site", HYBRID: "Hybrid", REMOTE: "Remote" } as const
export const TYPE_LABEL = { FULL_TIME: "Full-time", PART_TIME: "Part-time", CONTRACT: "Contract", INTERNSHIP: "Internship" } as const
