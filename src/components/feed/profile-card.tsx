"use client"

import Link from "next/link"
import { Bookmark, ChevronRight } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"
import { ProfileCardSkeleton } from "@/components/skeletons"
import { useMe } from "@/hooks/queries"

export function ProfileCard() {
  const { data: me, isPending } = useMe()
  if (isPending || !me) return <ProfileCardSkeleton />

  return (
    <div className="space-y-2">
      <div className="card-surface overflow-hidden">
        <div className="h-14" style={{ background: me.bannerColor }} />
        <div className="-mt-9 px-4 pb-4">
          <Link href={`/in/${me.handle}`} className="inline-block rounded-full">
            <UserAvatar user={me} size={72} ring />
          </Link>
          <Link href={`/in/${me.handle}`} className="mt-2 block text-lg leading-6 font-semibold hover:underline">
            {me.name}
          </Link>
          <p className="mt-0.5 text-xs leading-4 text-foreground">{me.headline}</p>
          {me.location && <p className="mt-1 text-xs text-muted-foreground">{me.location}</p>}
        </div>
      </div>

      <div className="card-surface py-2 text-xs">
        <Link href="/mynetwork" className="flex items-center justify-between px-4 py-1 hover:bg-accent">
          <span className="font-semibold text-muted-foreground">Connections</span>
          <span className="tabular font-semibold text-primary">{me.stats.connections}</span>
        </Link>
        <Link href={`/in/${me.handle}`} className="flex items-center justify-between px-4 py-1 hover:bg-accent">
          <span className="font-semibold text-muted-foreground">Reactions on your posts</span>
          <span className="tabular font-semibold text-primary">{me.stats.postReactions}</span>
        </Link>
      </div>

      <div className="card-surface py-2 text-xs font-semibold">
        <Link href="/jobs" className="flex items-center gap-2 px-4 py-2 hover:bg-accent">
          <Bookmark className="size-4" fill="currentColor" /> Saved items
          <ChevronRight className="ml-auto size-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  )
}
