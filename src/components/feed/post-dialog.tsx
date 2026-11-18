"use client"

import { useState } from "react"
import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { UserAvatar } from "@/components/user-avatar"
import { qk, useMe } from "@/hooks/queries"
import { getSelectedModel } from "@/components/ai/assistant-store"
import { api } from "@/lib/fetcher"
import type { FeedPost, Page } from "@/lib/types"

const MAX = 3000

export default function PostDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient()
  const { data: me } = useMe()
  const [text, setText] = useState("")

  const create = useMutation({
    mutationFn: (content: string) => api<FeedPost>("/api/posts", { method: "POST", json: { content } }),
    onSuccess: (post) => {
      qc.setQueryData<InfiniteData<Page<FeedPost>>>(qk.feed, (d) =>
        d ? { ...d, pages: d.pages.map((p, i) => (i === 0 ? { ...p, items: [post, ...p.items] } : p)) } : d
      )
      setText("")
      onOpenChange(false)
      toast.success("Your post is live.")
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    onError: (e) => toast.error(e.message),
  })

  const rewrite = useMutation({
    mutationFn: (draft: string) => api<{ text: string }>("/api/ai/rewrite", { method: "POST", json: { text: draft, tone: "professional", model: getSelectedModel() } }),
    onSuccess: (r) => setText(r.text.slice(0, MAX)),
    onError: (e) => toast.error(e.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-[552px]">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl font-normal">
            {me && <UserAvatar user={me} size={48} />}
            <span className="flex flex-col text-left">
              <span className="text-base font-semibold">{me?.name}</span>
              <span className="text-sm text-muted-foreground">Post to Anyone</span>
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">Write a post for your network</DialogDescription>
        </DialogHeader>
        <div className="px-4">
          <textarea
            autoFocus
            value={text}
            maxLength={MAX}
            onChange={(e) => setText(e.target.value)}
            placeholder="What do you want to talk about?"
            aria-label="Post text"
            className="min-h-48 w-full resize-none text-lg leading-7 outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!text.trim() || rewrite.isPending}
            onClick={() => rewrite.mutate(text)}
            className="text-rust hover:text-rust"
          >
            {rewrite.isPending ? <Spinner /> : <Sparkles />} Rewrite with AI
          </Button>
          <div className="flex items-center gap-3">
            <span className="tabular text-xs text-muted-foreground">
              {text.length.toLocaleString()}/{MAX.toLocaleString()}
            </span>
            <Button disabled={!text.trim() || create.isPending} onClick={() => create.mutate(text)}>
              {create.isPending ? "Posting…" : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
