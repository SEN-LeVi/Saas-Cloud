"use client"

import Link from "next/link"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import { BriefcaseBusiness, MessageSquareText, MoreHorizontal, ThumbsUp, UserCheck, UserPlus } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"
import { NotificationsPageSkeleton } from "@/components/skeletons"
import { NewsRail } from "@/components/feed/news-rail"
import { qk, useNotifications } from "@/hooks/queries"
import { api } from "@/lib/fetcher"
import { timeAgo } from "@/lib/format"
import type { Me, NotificationItem } from "@/lib/types"
import { cn } from "@/lib/utils"

const TYPE_ICON = {
  REACTION: { icon: ThumbsUp, color: "#378fe9" },
  COMMENT: { icon: MessageSquareText, color: "#0a66c2" },
  CONNECTION_REQUEST: { icon: UserPlus, color: "#057642" },
  CONNECTION_ACCEPTED: { icon: UserCheck, color: "#057642" },
  MESSAGE: { icon: MessageSquareText, color: "#0a66c2" },
  JOB: { icon: BriefcaseBusiness, color: "#b24020" },
} as const

const FILTERS = [
  { key: "all", label: "All" },
  { key: "posts", label: "My posts" },
  { key: "network", label: "Network" },
  { key: "jobs", label: "Jobs" },
] as const

export function NotificationsView() {
  const { data, isPending } = useNotifications()
  const qc = useQueryClient()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all")
  const markRead = useMutation({
    mutationFn: () => api("/api/notifications/read", { method: "POST" }),
    onSuccess: () => qc.setQueryData<Me>(qk.me, (m) => (m ? { ...m, stats: { ...m.stats, unreadNotifications: 0 } } : m)),
  })

  // Visiting the page marks everything as seen (unread dots stay visible for this visit).
  const hasUnread = Boolean(data?.some((n) => !n.read))
  useEffect(() => {
    if (hasUnread) markRead.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnread])

  const items = (data ?? []).filter((n) =>
    filter === "all"
      ? true
      : filter === "posts"
        ? n.type === "REACTION" || n.type === "COMMENT"
        : filter === "network"
          ? n.type === "CONNECTION_REQUEST" || n.type === "CONNECTION_ACCEPTED"
          : n.type === "JOB"
  )

  if (isPending) return <NotificationsPageSkeleton />

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[225px_1fr] lg:grid-cols-[225px_1fr_300px]">
      <aside className="hidden md:block">
        <div className="card-surface p-4 md:sticky md:top-[76px]">
          <h2 className="text-base font-semibold">Manage your notifications</h2>
          <a href="#" className="mt-1 inline-block text-sm font-semibold text-primary hover:underline">
            View settings
          </a>
        </div>
      </aside>
      <section className="min-w-0 space-y-2" aria-label="Notifications">
        <div className="card-surface flex flex-wrap gap-2 p-3" role="radiogroup" aria-label="Filter notifications">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="radio"
              aria-checked={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "h-8 rounded-full px-3 text-sm font-semibold transition-colors",
                filter === f.key
                  ? "bg-success text-white"
                  : "text-muted-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.6)] hover:bg-accent hover:shadow-[inset_0_0_0_2px_rgb(0_0_0/0.75)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="card-surface overflow-hidden">
          {items.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Nothing here yet. Activity on your posts and network will appear here.</p>
          ) : (
            <VirtualList items={items} />
          )}
        </div>
      </section>
      <aside className="hidden lg:block">
        <NewsRail />
      </aside>
    </div>
  )
}

function VirtualList({ items }: { items: NotificationItem[] }) {
  const ref = useRef<HTMLUListElement>(null)
  const [margin, setMargin] = useState(0)
  useLayoutEffect(() => setMargin(ref.current?.offsetTop ?? 0), [])
  const v = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => 84,
    overscan: 8,
    scrollMargin: margin,
    getItemKey: (i) => items[i].id,
  })
  return (
    <ul ref={ref} style={{ height: v.getTotalSize(), position: "relative" }}>
      {v.getVirtualItems().map((row) => {
        const n = items[row.index]
        const t = TYPE_ICON[n.type]
        const Icon = t.icon
        const body = (
          <>
            <span className="relative shrink-0">
              {n.actor ? (
                <UserAvatar user={n.actor} size={48} />
              ) : (
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-muted">
                  <Icon className="size-6" style={{ color: t.color }} />
                </span>
              )}
              {n.actor && (
                <span className="absolute -right-1 -bottom-1 inline-flex size-5 items-center justify-center rounded-full bg-white shadow-card">
                  <Icon className="size-3" style={{ color: t.color }} />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1 text-sm">
              {n.actor && <span className="font-semibold">{n.actor.name} </span>}
              {n.text}
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground">
              {timeAgo(n.createdAt)}
              <MoreHorizontal className="size-5" />
            </span>
          </>
        )
        return (
          <li
            key={row.key}
            data-index={row.index}
            ref={v.measureElement}
            className="absolute inset-x-0 top-0"
            style={{ transform: `translateY(${row.start - v.options.scrollMargin}px)` }}
          >
            <Link
              href={n.href ?? "#"}
              className={cn(
                "relative flex items-start gap-3 border-b border-border px-4 py-4 transition-colors hover:bg-black/[0.03]",
                !n.read && "bg-primary-soft hover:bg-[#dde9f6]"
              )}
            >
              {!n.read && <span className="absolute top-1/2 left-1 size-2 -translate-y-1/2 rounded-full bg-primary" aria-label="Unread" />}
              {body}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
