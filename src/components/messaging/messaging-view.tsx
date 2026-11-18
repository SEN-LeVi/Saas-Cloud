"use client"

import Link from "next/link"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useVirtualizer } from "@tanstack/react-virtual"
import { ArrowLeft, Search, SendHorizontal, SquarePen } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import { ConversationRowSkeleton, MessagingPageSkeleton } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"
import { qk, useConversations, useMe, useMessages } from "@/hooks/queries"
import { api } from "@/lib/fetcher"
import { timeAgo } from "@/lib/format"
import type { ConversationItem, MessageItem } from "@/lib/types"
import { cn } from "@/lib/utils"

export function MessagingView() {
  const { data: convos, isPending } = useConversations()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [filter, setFilter] = useState("")
  const qc = useQueryClient()

  // Deep link: /messaging?c=<conversationId>
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("c")
    if (c) setActiveId(c)
  }, [])

  const list = (convos ?? []).filter((c) => c.other.name.toLowerCase().includes(filter.toLowerCase()))
  const active = convos?.find((c) => c.id === activeId) ?? null

  const listRef = useRef<HTMLDivElement>(null)
  const v = useVirtualizer({
    count: list.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 92,
    overscan: 8,
    getItemKey: (i) => list[i].id,
  })

  if (isPending) return <MessagingPageSkeleton />

  return (
    <div className="card-surface grid h-[calc(100dvh-140px)] min-h-[480px] grid-cols-1 overflow-hidden md:grid-cols-[340px_1fr]">
      <div className={cn("flex min-h-0 flex-col border-r border-border", active && "hidden md:flex")}>
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <h1 className="text-base font-semibold">Messaging</h1>
          <button type="button" aria-label="New message" className="rounded-full p-2 text-muted-foreground hover:bg-accent">
            <SquarePen className="size-5" />
          </button>
        </div>
        <label className="relative m-2">
          <span className="sr-only">Search messages</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search messages"
            className="h-8 w-full rounded-[4px] bg-search pr-2 pl-9 text-sm outline-none focus:shadow-[inset_0_0_0_2px_rgb(0_0_0/0.9)]"
          />
        </label>
        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No conversations yet. Message someone from their profile.</p>
          ) : (
            <ul style={{ height: v.getTotalSize(), position: "relative" }}>
              {v.getVirtualItems().map((row) => {
                const c = list[row.index]
                return (
                  <li key={row.key} className="absolute inset-x-0 top-0" style={{ height: row.size, transform: `translateY(${row.start}px)` }}>
                    <ConversationRow
                      convo={c}
                      active={c.id === activeId}
                      onSelect={() => {
                        setActiveId(c.id)
                        if (c.unread) {
                          qc.setQueryData<ConversationItem[]>(qk.conversations, (d) => d?.map((x) => (x.id === c.id ? { ...x, unread: false } : x)))
                          // Opening the thread marks it read on the server; refresh the nav badge after.
                          setTimeout(() => qc.invalidateQueries({ queryKey: qk.me }), 800)
                        }
                      }}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      <div className={cn("min-h-0", !active && "hidden md:block")}>
        {active ? (
          <Thread convo={active} onBack={() => setActiveId(null)} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <p className="text-xl font-semibold">Select a conversation</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Pick a conversation on the left to read and reply.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ConversationRow({ convo, active, onSelect }: { convo: ConversationItem; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex h-full w-full gap-2 px-3 py-3 text-left transition-colors hover:bg-black/[0.03]",
        active && "bg-primary-soft after:absolute after:inset-y-0 after:left-0 after:w-0.5 after:bg-success hover:bg-primary-soft"
      )}
    >
      <UserAvatar user={convo.other} size={56} />
      <span className="min-w-0 flex-1 border-b border-border pb-2">
        <span className="flex items-baseline justify-between gap-2">
          <span className={cn("truncate text-base", convo.unread ? "font-semibold" : "font-normal")}>{convo.other.name}</span>
          {convo.lastMessage && <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(convo.lastMessage.createdAt)}</span>}
        </span>
        <span className={cn("line-clamp-1 text-sm", convo.unread ? "font-semibold text-foreground" : "text-muted-foreground")}>
          {convo.lastMessage ? `${convo.lastMessage.fromMe ? "You: " : ""}${convo.lastMessage.content}` : "Say hello 👋"}
        </span>
      </span>
      {convo.unread && <span className="mt-2 size-2.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
    </button>
  )
}

function Thread({ convo, onBack }: { convo: ConversationItem; onBack: () => void }) {
  const { data: me } = useMe()
  const { data: messages, isPending } = useMessages(convo.id)
  const qc = useQueryClient()
  const [text, setText] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const items = messages ?? []

  const v = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 64,
    overscan: 10,
    getItemKey: (i) => items[i].id,
  })

  useLayoutEffect(() => {
    if (items.length) v.scrollToIndex(items.length - 1, { align: "end" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, convo.id])

  const send = useMutation({
    mutationFn: (content: string) => api<MessageItem>(`/api/messages/${convo.id}`, { method: "POST", json: { content } }),
    onMutate: (content) => {
      const temp: MessageItem = { id: `temp-${Date.now()}`, content, createdAt: new Date().toISOString(), senderId: me?.id ?? "" }
      qc.setQueryData<MessageItem[]>(qk.messages(convo.id), (d) => [...(d ?? []), temp])
      setText("")
      return { temp }
    },
    onSuccess: (msg, _v, ctx) => {
      qc.setQueryData<MessageItem[]>(qk.messages(convo.id), (d) => d?.map((m) => (m.id === ctx?.temp.id ? msg : m)))
      qc.setQueryData<ConversationItem[]>(qk.conversations, (d) => {
        if (!d) return d
        const updated = d.map((c) => (c.id === convo.id ? { ...c, lastMessage: { content: msg.content, createdAt: msg.createdAt, fromMe: true }, updatedAt: msg.createdAt } : c))
        return updated.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      })
    },
    onError: (e, _v, ctx) => {
      qc.setQueryData<MessageItem[]>(qk.messages(convo.id), (d) => d?.filter((m) => m.id !== ctx?.temp.id))
      toast.error(e.message)
    },
  })

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-2 border-b border-border px-3 py-2">
        <button type="button" onClick={onBack} aria-label="Back to conversations" className="rounded-full p-1.5 hover:bg-accent md:hidden">
          <ArrowLeft className="size-5" />
        </button>
        <Link href={`/in/${convo.other.handle}`} className="flex min-w-0 items-center gap-2">
          <UserAvatar user={convo.other} size={40} />
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold hover:underline">{convo.other.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{convo.other.headline}</span>
          </span>
        </Link>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4">
        {isPending ? (
          <div className="space-y-4 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ConversationRowSkeleton key={i} />
            ))}
          </div>
        ) : (
          <ol style={{ height: v.getTotalSize(), position: "relative" }} aria-label="Messages">
            {v.getVirtualItems().map((row) => {
              const m = items[row.index]
              const prev = items[row.index - 1]
              const grouped = prev && prev.senderId === m.senderId && new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60_000
              const mine = m.senderId === me?.id
              const author = mine ? me : convo.other
              return (
                <li key={row.key} data-index={row.index} ref={v.measureElement} className="absolute inset-x-0 top-0" style={{ transform: `translateY(${row.start}px)` }}>
                  <div className={cn("flex gap-2", grouped ? "pt-1" : "pt-4")}>
                    <span className="w-10 shrink-0">{!grouped && author && <UserAvatar user={author} size={40} />}</span>
                    <div className="min-w-0 flex-1">
                      {!grouped && (
                        <p className="text-sm">
                          <span className="font-semibold">{mine ? me?.name : convo.other.name}</span>{" "}
                          <span className="text-xs text-muted-foreground">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                          </span>
                        </p>
                      )}
                      <p className={cn("text-sm whitespace-pre-wrap break-words", m.id.startsWith("temp-") && "opacity-60")}>{m.content}</p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
        {isPending && <Skeleton className="sr-only" />}
      </div>

      <form
        className="border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (text.trim()) send.mutate(text.trim())
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              if (text.trim()) send.mutate(text.trim())
            }
          }}
          rows={2}
          placeholder="Write a message…"
          aria-label="Write a message"
          className="w-full resize-none rounded-md bg-muted px-3 py-2 text-sm outline-none focus:shadow-[inset_0_0_0_1px_var(--primary)]"
        />
        <div className="mt-2 flex justify-end">
          <Button type="submit" size="sm" disabled={!text.trim()}>
            Send <SendHorizontal />
          </Button>
        </div>
      </form>
    </div>
  )
}
