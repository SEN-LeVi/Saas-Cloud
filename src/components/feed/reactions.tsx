import { HandHeart, Heart, Laugh, Lightbulb, PartyPopper, ThumbsUp, type LucideIcon } from "lucide-react"
import type { ReactionKind } from "@/lib/types"
import { cn } from "@/lib/utils"

export const REACTIONS: Record<ReactionKind, { label: string; icon: LucideIcon; bg: string; text: string }> = {
  LIKE: { label: "Like", icon: ThumbsUp, bg: "#378fe9", text: "#0a66c2" },
  CELEBRATE: { label: "Celebrate", icon: PartyPopper, bg: "#44712e", text: "#44712e" },
  SUPPORT: { label: "Support", icon: HandHeart, bg: "#715e86", text: "#715e86" },
  LOVE: { label: "Love", icon: Heart, bg: "#df704d", text: "#b24020" },
  INSIGHTFUL: { label: "Insightful", icon: Lightbulb, bg: "#e7a33e", text: "#915907" },
  FUNNY: { label: "Funny", icon: Laugh, bg: "#1a9aa6", text: "#0e6f78" },
}

export const REACTION_ORDER: ReactionKind[] = ["LIKE", "CELEBRATE", "SUPPORT", "LOVE", "INSIGHTFUL", "FUNNY"]

/** Small filled reaction badge (white glyph on the reaction's color). */
export function ReactionBadge({ kind, size = 16, className }: { kind: ReactionKind; size?: number; className?: string }) {
  const r = REACTIONS[kind]
  const Icon = r.icon
  return (
    <span
      title={r.label}
      style={{ width: size, height: size, background: r.bg }}
      className={cn("inline-flex items-center justify-center rounded-full text-white ring-[1.5px] ring-white", className)}
    >
      <Icon style={{ width: size * 0.6, height: size * 0.6 }} strokeWidth={2.5} fill={kind === "LOVE" ? "currentColor" : "none"} />
    </span>
  )
}
