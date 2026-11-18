"use client"

import { useSyncExternalStore } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { api } from "@/lib/fetcher"
import type {
  ConversationItem,
  FeedPost,
  JobItem,
  Me,
  MessageItem,
  NetworkData,
  NotificationItem,
  Page,
  Profile,
  SearchResults,
} from "@/lib/types"

const noopSubscribe = () => () => {}

/** false during server render and hydration, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}

/**
 * The persisted cache can be restored before hydration finishes. Until hydration is done we
 * report "pending" so the client's first render matches the server's skeleton exactly; the
 * very next render shows the cached data instantly (no network wait).
 */
function gate<Q extends { data: unknown; isPending: boolean }>(q: Q, hydrated: boolean): Q {
  if (hydrated) return q
  return { ...q, data: undefined, isPending: true }
}

export const qk = {
  me: ["me"] as const,
  feed: ["feed"] as const,
  comments: (postId: string) => ["comments", postId] as const,
  network: ["network"] as const,
  jobs: (q: string, workplace: string) => ["jobs", q, workplace] as const,
  conversations: ["conversations"] as const,
  messages: (id: string) => ["messages", id] as const,
  notifications: ["notifications"] as const,
  profile: (handle: string) => ["profile", handle] as const,
  search: (q: string) => ["search", q] as const,
}

export const useMe = () => gate(useQuery({ queryKey: qk.me, queryFn: () => api<Me>("/api/me") }), useHydrated())

export const useFeed = () => gate(useInfiniteQuery({
    queryKey: qk.feed,
    initialPageParam: "",
    queryFn: ({ pageParam }) => api<Page<FeedPost>>(`/api/feed?limit=10${pageParam ? `&cursor=${pageParam}` : ""}`),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  }), useHydrated())

export const useNetwork = () => gate(useQuery({ queryKey: qk.network, queryFn: () => api<NetworkData>("/api/network") }), useHydrated())

export const useJobs = (q: string, workplace: string) => gate(useInfiniteQuery({
    queryKey: qk.jobs(q, workplace),
    initialPageParam: "",
    queryFn: ({ pageParam }) => {
      const sp = new URLSearchParams({ limit: "20" })
      if (pageParam) sp.set("cursor", pageParam)
      if (q) sp.set("q", q)
      if (workplace) sp.set("workplace", workplace)
      return api<Page<JobItem>>(`/api/jobs?${sp}`)
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  }), useHydrated())

export const useConversations = () =>
  gate(useQuery({ queryKey: qk.conversations, queryFn: () => api<ConversationItem[]>("/api/messages") }), useHydrated())

export const useMessages = (id: string | null) => gate(useQuery({
    queryKey: qk.messages(id ?? ""),
    queryFn: () => api<MessageItem[]>(`/api/messages/${id}`),
    enabled: Boolean(id),
    refetchInterval: 15_000,
  }), useHydrated())

export const useNotifications = () =>
  gate(useQuery({ queryKey: qk.notifications, queryFn: () => api<NotificationItem[]>("/api/notifications") }), useHydrated())

export const useProfile = (handle: string) =>
  gate(useQuery({ queryKey: qk.profile(handle), queryFn: () => api<Profile>(`/api/profile/${encodeURIComponent(handle)}`), enabled: Boolean(handle) }), useHydrated())

export const useSearch = (q: string) =>
  gate(useQuery({ queryKey: qk.search(q), queryFn: () => api<SearchResults>(`/api/search?q=${encodeURIComponent(q)}`), enabled: q.length > 0 }), useHydrated())
