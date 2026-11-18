"use client"

import Link from "next/link"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { qk, useMe } from "@/hooks/queries"
import { api } from "@/lib/fetcher"
import { timeAgo } from "@/lib/format"
import type { CommentItem } from "@/lib/types"
import { useUpdatePost } from "./use-feed-cache"

export default function Comments({ postId, onAdded }: { postId: string; onAdded?: () => void }) {
  const qc = useQueryClient()
  const { data: me } = useMe()
  const [text, setText] = useState("")
  const updatePost = useUpdatePost()
  const { data, isPending } = useQuery({
    queryKey: qk.comments(postId),
    queryFn: () => api<CommentItem[]>(`/api/posts/${postId}/comments`),
  })

  const add = useMutation({
    mutationFn: (content: string) => api<CommentItem>(`/api/posts/${postId}/comments`, { method: "POST", json: { content } }),
    onSuccess: (c) => {
      qc.setQueryData<CommentItem[]>(qk.comments(postId), (old) => [c, ...(old ?? [])])
      updatePost(postId, (p) => ({ ...p, commentCount: p.commentCount + 1 }))
      setText("")
      onAdded?.()
    },
    onError: (e) => toast.error(e.message),
  })

  return (
    <section aria-label="Comments" className="px-4 pb-3">
      <form
        className="flex items-start gap-2 pt-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (text.trim()) add.mutate(text.trim())
        }}
      >
        {me && <UserAvatar user={me} size={40} />}
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={1}
            placeholder="Add a comment…"
            aria-label="Add a comment"
            className="min-h-10 w-full resize-none rounded-[20px] px-4 py-2.5 text-sm shadow-[inset_0_0_0_1px_rgb(0_0_0/0.6)] outline-none field-sizing-content placeholder:text-muted-foreground focus:shadow-[inset_0_0_0_2px_rgb(0_0_0/0.9)]"
          />
          {text.trim() && (
            <Button type="submit" size="sm" className="mt-2" disabled={add.isPending}>
              {add.isPending ? "Posting…" : "Comment"}
            </Button>
          )}
        </div>
      </form>

      <ol className="mt-3 space-y-3">
        {isPending &&
          Array.from({ length: 2 }).map((_, i) => (
            <li key={i} className="flex gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-14 flex-1 rounded-lg" />
            </li>
          ))}
        {data?.map((c) => (
          <li key={c.id} className="flex gap-2">
            <Link href={`/in/${c.author.handle}`} className="shrink-0">
              <UserAvatar user={c.author} size={32} />
            </Link>
            <div className="min-w-0 flex-1 rounded-lg rounded-tl-none bg-muted px-3 py-2">
              <div className="flex items-baseline justify-between gap-2">
                <Link href={`/in/${c.author.handle}`} className="truncate text-sm font-semibold hover:text-primary hover:underline">
                  {c.author.name}
                </Link>
                <time className="shrink-0 text-xs text-muted-foreground" dateTime={c.createdAt}>
                  {timeAgo(c.createdAt)}
                </time>
              </div>
              <p className="truncate text-xs text-muted-foreground">{c.author.headline}</p>
              <p className="mt-1.5 text-sm whitespace-pre-wrap break-words">{c.content}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
