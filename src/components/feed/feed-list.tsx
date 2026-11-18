"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import { PostSkeleton } from "@/components/skeletons"
import { Button } from "@/components/ui/button"
import { useFeed } from "@/hooks/queries"
import { PostCard } from "./post-card"

/**
 * Virtualized, infinitely-loading feed. Only the posts near the viewport are mounted;
 * heights are measured on the fly so expanded posts and opened comments stay correct.
 */
export function FeedList() {
  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useFeed()
  const posts = data?.pages.flatMap((p) => p.items) ?? []
  const listRef = useRef<HTMLDivElement>(null)
  const [scrollMargin, setScrollMargin] = useState(0)

  useLayoutEffect(() => {
    setScrollMargin(listRef.current?.offsetTop ?? 0)
  }, [isPending])

  const virtualizer = useWindowVirtualizer({
    count: hasNextPage ? posts.length + 1 : posts.length,
    estimateSize: () => 280,
    overscan: 4,
    gap: 8,
    scrollMargin,
    getItemKey: (i) => posts[i]?.id ?? "loader",
  })
  const items = virtualizer.getVirtualItems()

  const last = items[items.length - 1]
  useEffect(() => {
    if (last && last.index >= posts.length - 2 && hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [last, posts.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isPending) {
    return (
      <div className="space-y-2">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    )
  }
  if (isError) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="font-semibold">We couldn&apos;t load your feed.</p>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        <Button variant="outline" className="mt-3" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }
  if (posts.length === 0) {
    return (
      <div className="card-surface p-8 text-center">
        <p className="text-base font-semibold">Your feed is quiet</p>
        <p className="mt-1 text-sm text-muted-foreground">Start a post or connect with people to see updates here.</p>
      </div>
    )
  }

  return (
    <div ref={listRef} style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
      {items.map((row) => {
        const post = posts[row.index]
        return (
          <div
            key={row.key}
            data-index={row.index}
            ref={virtualizer.measureElement}
            className="absolute inset-x-0 top-0"
            style={{ transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)` }}
          >
            {post ? <PostCard post={post} /> : <PostSkeleton />}
          </div>
        )
      })}
    </div>
  )
}
