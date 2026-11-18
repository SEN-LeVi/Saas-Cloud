"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { memo, useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Earth, MessageSquareText, MoreHorizontal, Plus, Repeat2, Send, ThumbsUp } from "lucide-react"
import { toast } from "sonner"
import { UserAvatar } from "@/components/user-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/fetcher"
import { useMe } from "@/hooks/queries"
import { compactNumber, timeAgo } from "@/lib/format"
import type { FeedPost, ReactionKind } from "@/lib/types"
import { cn } from "@/lib/utils"
import { REACTIONS, REACTION_ORDER, ReactionBadge } from "./reactions"
import { useUpdatePost } from "./use-feed-cache"

// Comments are only fetched and rendered when the reader opens them.
const Comments = dynamic(() => import("./comments"), {
  ssr: false,
  loading: () => (
    <div className="space-y-3 px-4 pb-4">
      <Skeleton className="h-10 w-full rounded-full" />
      <Skeleton className="h-14 w-full rounded-lg" />
    </div>
  ),
})

function PostCardBase({ post, onCommentAdded }: { post: FeedPost; onCommentAdded?: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const updatePost = useUpdatePost()
  const { data: me } = useMe()
  const isMine = me?.id === post.author.id
  const long = post.content.length > 220 || post.content.split("\n").length > 3

  const react = useMutation({
    mutationFn: (type: ReactionKind | null) => api(`/api/posts/${post.id}/react`, { method: "POST", json: { type } }),
    onMutate: (type) => {
      const prev = post
      updatePost(post.id, (p) => {
        const had = p.myReaction !== null
        const count = p.reactionCount + (type && !had ? 1 : !type && had ? -1 : 0)
        const top = type && !p.topReactions.includes(type) ? [type, ...p.topReactions].slice(0, 3) : p.topReactions
        return { ...p, myReaction: type, reactionCount: count, topReactions: count === 0 ? [] : top }
      })
      return { prev }
    },
    onError: (err, _v, ctx) => {
      if (ctx) updatePost(post.id, () => ctx.prev)
      toast.error(err.message)
    },
  })

  const mine = post.myReaction ? REACTIONS[post.myReaction] : null
  const MineIcon = mine?.icon ?? ThumbsUp

  return (
    <article id={`post-${post.id}`} className="card-surface" aria-label={`Post by ${post.author.name}`}>
      <header className="flex gap-2 px-4 pt-3">
        <Link href={`/in/${post.author.handle}`} className="shrink-0 rounded-full">
          <UserAvatar user={post.author} size={48} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/in/${post.author.handle}`} className="text-sm leading-5 font-semibold hover:text-primary hover:underline">
            {post.author.name}
          </Link>
          <p className="truncate text-xs leading-4 text-muted-foreground">{post.author.headline}</p>
          <p className="flex items-center gap-1 text-xs leading-4 text-muted-foreground">
            <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time> • <Earth className="size-3" aria-label="Public" />
          </p>
        </div>
        <button type="button" aria-label="More actions" className="h-8 rounded-full p-1 text-muted-foreground hover:bg-accent">
          <MoreHorizontal className="size-5" />
        </button>
        {!isMine && (
          <Link
            href={`/in/${post.author.handle}`}
            className="flex h-8 items-center gap-0.5 rounded-md px-2 text-sm font-semibold text-primary hover:bg-primary-soft"
          >
            <Plus className="size-4" /> Follow
          </Link>
        )}
      </header>

      <div className="px-4 pt-2 pb-2">
        <p className={cn("text-sm leading-5 whitespace-pre-wrap break-words", !expanded && long && "line-clamp-3")}>{post.content}</p>
        {long && !expanded && (
          <button type="button" onClick={() => setExpanded(true)} className="text-sm text-muted-foreground hover:text-primary hover:underline">
            …more
          </button>
        )}
      </div>

      {(post.reactionCount > 0 || post.commentCount > 0) && (
        <div className="mx-4 flex items-center justify-between py-2 text-xs text-muted-foreground">
          {post.reactionCount > 0 ? (
            <span className="flex items-center gap-1">
              <span className="flex -space-x-1">
                {post.topReactions.map((r) => (
                  <ReactionBadge key={r} kind={r} />
                ))}
              </span>
              <span className="tabular hover:text-primary hover:underline">{compactNumber(post.reactionCount)}</span>
            </span>
          ) : (
            <span />
          )}
          {post.commentCount > 0 && (
            <button type="button" onClick={() => setShowComments(true)} className="tabular hover:text-primary hover:underline">
              {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
            </button>
          )}
        </div>
      )}

      <div className="mx-4 grid grid-cols-4 border-t border-border py-1">
        <div
          className="relative"
          onMouseEnter={() => {
            hoverTimer.current = setTimeout(() => setPickerOpen(true), 450)
          }}
          onMouseLeave={() => {
            if (hoverTimer.current) clearTimeout(hoverTimer.current)
            setPickerOpen(false)
          }}
        >
          {pickerOpen && (
            <div
              role="menu"
              aria-label="Reactions"
              className="absolute bottom-full left-0 z-10 mb-1 flex gap-1 rounded-full bg-white p-1.5 shadow-float animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-1"
            >
              {REACTION_ORDER.map((k) => (
                <button
                  key={k}
                  type="button"
                  role="menuitem"
                  aria-label={REACTIONS[k].label}
                  onClick={() => {
                    setPickerOpen(false)
                    react.mutate(k)
                  }}
                  className="transition-transform duration-150 ease-out hover:-translate-y-1 hover:scale-125"
                >
                  <ReactionBadge kind={k} size={36} className="ring-0" />
                </button>
              ))}
            </div>
          )}
          <ActionButton
            onClick={() => react.mutate(post.myReaction ? null : "LIKE")}
            aria-pressed={Boolean(post.myReaction)}
            style={mine ? { color: mine.text } : undefined}
          >
            <MineIcon className="size-5" fill={post.myReaction === "LIKE" ? "currentColor" : "none"} />
            <span>{mine?.label ?? "Like"}</span>
          </ActionButton>
        </div>
        <ActionButton onClick={() => setShowComments(true)}>
          <MessageSquareText className="size-5" /> <span>Comment</span>
        </ActionButton>
        <ActionButton onClick={() => toast("Reposting is coming soon.")}>
          <Repeat2 className="size-5" /> <span>Repost</span>
        </ActionButton>
        <ActionButton
          onClick={async () => {
            await navigator.clipboard?.writeText(`${location.origin}/feed#post-${post.id}`).catch(() => {})
            toast.success("Link copied to clipboard")
          }}
        >
          <Send className="size-5" /> <span>Send</span>
        </ActionButton>
      </div>

      {showComments && <Comments postId={post.id} onAdded={onCommentAdded} />}
    </article>
  )
}

function ActionButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-12 w-full items-center justify-center gap-1.5 rounded-md text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        "[&>span]:hidden sm:[&>span]:inline",
        className
      )}
      {...props}
    />
  )
}

export const PostCard = memo(PostCardBase)
