"use client"

import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { BookUser, CalendarDays, Clock3, Contact, Hash, Newspaper, UserPlus, Users, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import { NetworkPageSkeleton } from "@/components/skeletons"
import { qk, useNetwork } from "@/hooks/queries"
import { api } from "@/lib/fetcher"
import { timeAgo } from "@/lib/format"
import type { NetworkData } from "@/lib/types"

export function NetworkView() {
  const { data, isPending, isError, error, refetch } = useNetwork()
  const qc = useQueryClient()

  const respond = useMutation({
    mutationFn: (v: { connectionId: string; accept: boolean }) => api("/api/network/respond", { method: "POST", json: v }),
    onMutate: ({ connectionId, accept }) => {
      qc.setQueryData<NetworkData>(qk.network, (d) =>
        d ? { ...d, invitations: d.invitations.filter((i) => i.id !== connectionId), connections: d.connections + (accept ? 1 : 0) } : d
      )
    },
    onSuccess: (_d, v) => {
      toast.success(v.accept ? "Invitation accepted" : "Invitation ignored")
      qc.invalidateQueries({ queryKey: qk.me })
    },
    onError: (e) => {
      toast.error(e.message)
      qc.invalidateQueries({ queryKey: qk.network })
    },
  })

  const connect = useMutation({
    mutationFn: (userId: string) => api<{ status: string }>("/api/network/connect", { method: "POST", json: { userId } }),
    onMutate: (userId) => {
      qc.setQueryData<NetworkData>(qk.network, (d) =>
        d
          ? { ...d, suggestions: d.suggestions.map((s) => (s.id === userId ? { ...s, status: s.status === "NONE" ? "PENDING_OUT" : "NONE" } : s)) }
          : d
      )
    },
    onError: (e) => {
      toast.error(e.message)
      qc.invalidateQueries({ queryKey: qk.network })
    },
  })

  if (isPending) return <NetworkPageSkeleton />
  if (isError)
    return (
      <div className="card-surface p-6 text-center">
        <p className="font-semibold">We couldn&apos;t load your network.</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button variant="outline" className="mt-3" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
      <aside className="hidden md:block">
        <nav className="card-surface py-3 md:sticky md:top-[76px]" aria-label="Manage my network">
          <h2 className="px-4 pb-2 text-base font-semibold">Manage my network</h2>
          {[
            { icon: Users, label: "Connections", count: data.connections },
            { icon: Contact, label: "Following & followers" },
            { icon: Users, label: "Groups" },
            { icon: CalendarDays, label: "Events" },
            { icon: BookUser, label: "Pages" },
            { icon: Newspaper, label: "Newsletters" },
            { icon: Hash, label: "Hashtags" },
          ].map(({ icon: Icon, label, count }) => (
            <a key={label} href="#" className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent">
              <Icon className="size-5" /> {label}
              {count !== undefined && <span className="tabular ml-auto font-normal">{count}</span>}
            </a>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 space-y-2">
        <section className="card-surface" aria-labelledby="inv-title">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 id="inv-title" className="text-base font-semibold">
              Invitations {data.invitations.length > 0 && <span className="tabular">({data.invitations.length})</span>}
            </h2>
          </div>
          {data.invitations.length === 0 ? (
            <p className="border-t border-border px-4 py-4 text-sm text-muted-foreground">No pending invitations. New requests will show up here.</p>
          ) : (
            <ul>
              {data.invitations.map((inv) => (
                <li key={inv.id} className="flex items-center gap-3 border-t border-border px-4 py-3">
                  <Link href={`/in/${inv.from.handle}`}>
                    <UserAvatar user={inv.from} size={72} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/in/${inv.from.handle}`} className="font-semibold hover:underline">
                      {inv.from.name}
                    </Link>
                    <p className="truncate text-sm">{inv.from.headline}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="size-3" /> {timeAgo(inv.createdAt)} ago
                    </p>
                  </div>
                  <Button variant="ghost" onClick={() => respond.mutate({ connectionId: inv.id, accept: false })}>
                    Ignore
                  </Button>
                  <Button variant="outline" onClick={() => respond.mutate({ connectionId: inv.id, accept: true })}>
                    Accept
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card-surface p-4" aria-labelledby="pymk-title">
          <h2 id="pymk-title" className="text-base font-semibold">
            People you may know
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.suggestions.map((s) => (
              <li key={s.id} className="group relative flex flex-col overflow-hidden rounded-lg shadow-card transition-shadow hover:shadow-raised">
                <button type="button" aria-label={`Dismiss ${s.name}`} className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-1 text-white hover:bg-black/80">
                  <X className="size-4" />
                </button>
                <div className="h-[62px]" style={{ background: s.bannerColor }} />
                <Link href={`/in/${s.handle}`} className="-mt-[52px] flex flex-col items-center px-3 text-center">
                  <UserAvatar user={s} size={104} ring />
                  <span className="mt-2 line-clamp-1 text-base font-semibold group-hover:underline">{s.name}</span>
                  <span className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{s.headline}</span>
                </Link>
                <p className="mt-auto flex items-center justify-center gap-1 px-3 pt-3 text-xs text-muted-foreground">
                  {s.mutuals > 0 ? `${s.mutuals} mutual connection${s.mutuals > 1 ? "s" : ""}` : "Based on your profile"}
                </p>
                <div className="p-3">
                  <Button
                    variant={s.status === "PENDING_OUT" ? "secondary" : "outline"}
                    className="w-full"
                    onClick={() => connect.mutate(s.id)}
                  >
                    {s.status === "PENDING_OUT" ? (
                      <>
                        <Clock3 /> Pending
                      </>
                    ) : (
                      <>
                        <UserPlus /> Connect
                      </>
                    )}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
