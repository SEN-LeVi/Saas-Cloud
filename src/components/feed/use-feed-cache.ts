"use client"

import { useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { qk } from "@/hooks/queries"
import type { FeedPost, Page, Profile } from "@/lib/types"

/** Applies a change to a post everywhere it is cached (feed + profile activity). */
export function useUpdatePost() {
  const qc = useQueryClient()
  return (postId: string, fn: (p: FeedPost) => FeedPost) => {
    qc.setQueryData<InfiniteData<Page<FeedPost>>>(qk.feed, (data) =>
      data
        ? { ...data, pages: data.pages.map((pg) => ({ ...pg, items: pg.items.map((p) => (p.id === postId ? fn(p) : p)) })) }
        : data
    )
    qc.setQueriesData<Profile>({ queryKey: ["profile"] }, (prof) =>
      prof ? { ...prof, posts: prof.posts.map((p) => (p.id === postId ? fn(p) : p)) } : prof
    )
  }
}
