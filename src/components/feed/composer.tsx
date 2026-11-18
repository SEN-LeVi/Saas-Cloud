"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { CalendarDays, Image as ImageIcon, Newspaper } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"
import { ComposerSkeleton } from "@/components/skeletons"
import { useMe } from "@/hooks/queries"

// The post editor (with AI rewrite) is code-split; it downloads on first open.
const PostDialog = dynamic(() => import("./post-dialog"), { ssr: false })

export function Composer() {
  const { data: me, isPending } = useMe()
  const [open, setOpen] = useState(false)
  if (isPending || !me) return <ComposerSkeleton />

  return (
    <div className="card-surface px-4 pt-3 pb-1">
      <div className="flex gap-2">
        <UserAvatar user={me} size={48} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-12 flex-1 rounded-full px-4 text-left text-sm font-semibold text-muted-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.4)] transition-colors hover:bg-accent"
        >
          Start a post
        </button>
      </div>
      <div className="mt-1 flex justify-around">
        {[
          { label: "Media", icon: ImageIcon, color: "#378fe9" },
          { label: "Event", icon: CalendarDays, color: "#c37d16" },
          { label: "Write article", icon: Newspaper, color: "#e06847" },
        ].map(({ label, icon: Icon, color }) => (
          <button
            key={label}
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-12 items-center gap-2 rounded-md px-2 text-sm font-semibold text-muted-foreground hover:bg-accent"
          >
            <Icon className="size-5" style={{ color }} /> {label}
          </button>
        ))}
      </div>
      {open && <PostDialog open={open} onOpenChange={setOpen} />}
    </div>
  )
}
