"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { BriefcaseBusiness, Clock3, GraduationCap, MapPin, MessageSquareMore, Pencil, Sparkles, UserCheck, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CompanyLogo, UserAvatar } from "@/components/user-avatar"
import { ProfilePageSkeleton } from "@/components/skeletons"
import { PostCard } from "@/components/feed/post-card"
import { openAssistant } from "@/components/ai/assistant-store"
import { qk, useProfile } from "@/hooks/queries"
import { api } from "@/lib/fetcher"
import { monthYear } from "@/lib/format"
import type { Profile } from "@/lib/types"

export function ProfileView() {
  const { handle } = useParams<{ handle: string }>()
  const { data: p, isPending, isError, error } = useProfile(handle)
  const qc = useQueryClient()
  const router = useRouter()
  const [editing, setEditing] = useState(false)

  const connect = useMutation({
    mutationFn: () => api<{ status: Profile["connection"] }>("/api/network/connect", { method: "POST", json: { userId: p!.id } }),
    onSuccess: (r) => {
      qc.setQueryData<Profile>(qk.profile(handle), (d) => (d ? { ...d, connection: r.status } : d))
      qc.invalidateQueries({ queryKey: qk.network })
      toast.success(r.status === "PENDING_OUT" ? "Invitation sent" : r.status === "NONE" ? "Invitation withdrawn" : "Updated")
    },
    onError: (e) => toast.error(e.message),
  })
  const message = useMutation({
    mutationFn: () => api<{ id: string }>("/api/messages/start", { method: "POST", json: { userId: p!.id } }),
    onSuccess: ({ id }) => {
      qc.invalidateQueries({ queryKey: qk.conversations })
      router.push(`/messaging?c=${id}`)
    },
    onError: (e) => toast.error(e.message),
  })

  if (isPending) return <ProfilePageSkeleton />
  if (isError || !p)
    return (
      <div className="card-surface p-10 text-center">
        <p className="text-xl font-semibold">This page doesn&apos;t exist</p>
        <p className="mt-1 text-sm text-muted-foreground">{error?.message ?? "Check the link or search for the member."}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/feed">Go to your feed</Link>
        </Button>
      </div>
    )

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-2">
        <section className="card-surface overflow-hidden" aria-label="Profile">
          <div className="h-[120px] sm:h-[200px]" style={{ background: `linear-gradient(120deg, ${p.bannerColor}, color-mix(in srgb, ${p.bannerColor} 60%, #ffffff))` }} />
          <div className="relative px-4 pb-6 sm:px-6">
            <div className="-mt-[70px] sm:-mt-[112px]">
              <span className="relative inline-block rounded-full">
                <UserAvatar user={p} size={152} ring className="max-sm:!size-[104px] max-sm:!text-4xl" />
                {p.openToWork && (
                  <span className="absolute inset-x-0 bottom-1 mx-auto w-fit rounded-full bg-success px-2 py-0.5 text-[11px] font-bold tracking-wide text-white uppercase ring-2 ring-white">
                    #OpenToWork
                  </span>
                )}
              </span>
            </div>
            {p.isMe && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label="Edit intro"
                className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground hover:bg-accent"
              >
                <Pencil className="size-5" />
              </button>
            )}
            <h1 className="mt-3 text-2xl leading-8 font-semibold">{p.name}</h1>
            <p className="mt-0.5 max-w-[65ch] text-base">{p.headline}</p>
            <p className="mt-2 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              {p.location && (
                <>
                  <MapPin className="size-3.5" /> {p.location} ·
                </>
              )}
              <a href="#" className="font-semibold text-primary hover:underline">
                Contact info
              </a>
            </p>
            <p className="mt-2 text-sm">
              <Link href="/mynetwork" className="tabular font-semibold text-primary hover:underline">
                {p.connections > 500 ? "500+" : p.connections} connections
              </Link>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.isMe ? (
                <>
                  <Button onClick={() => setEditing(true)}>Edit profile</Button>
                  <Button variant="outline" onClick={openAssistant}>
                    <Sparkles /> Enhance profile with AI
                  </Button>
                </>
              ) : (
                <>
                  {p.connection === "CONNECTED" ? (
                    <Button variant="secondary" disabled>
                      <UserCheck /> Connected
                    </Button>
                  ) : p.connection === "PENDING_OUT" ? (
                    <Button variant="secondary" onClick={() => connect.mutate()}>
                      <Clock3 /> Pending
                    </Button>
                  ) : p.connection === "PENDING_IN" ? (
                    <Button asChild>
                      <Link href="/mynetwork">Respond to invitation</Link>
                    </Button>
                  ) : (
                    <Button onClick={() => connect.mutate()} disabled={connect.isPending}>
                      <UserPlus /> Connect
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => message.mutate()} disabled={message.isPending}>
                    <MessageSquareMore /> Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {p.about && (
          <Section title="About">
            <p className="max-w-[70ch] text-sm leading-6 whitespace-pre-line">{p.about}</p>
          </Section>
        )}

        <Section title="Activity" subtitle={`${p.connections} connections`}>
          {p.posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{p.isMe ? "You haven't posted yet." : `${p.name} hasn't posted yet.`}</p>
          ) : (
            <div className="-mx-2 space-y-2 sm:-mx-6">
              {p.posts.slice(0, 3).map((post) => (
                <div key={post.id} className="[&>article]:rounded-none [&>article]:shadow-none [&>article]:border-t [&>article]:border-border">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}
        </Section>

        {p.experiences.length > 0 && (
          <Section title="Experience">
            <ul className="divide-y divide-border">
              {p.experiences.map((e) => (
                <li key={e.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <CompanyLogo name={e.company} color="#38434f" size={48} />
                  <div className="min-w-0">
                    <p className="text-base font-semibold">{e.title}</p>
                    <p className="text-sm">{e.company}</p>
                    <p className="text-sm text-muted-foreground">
                      {monthYear(e.startDate)} – {e.endDate ? monthYear(e.endDate) : "Present"}
                      {e.location && ` · ${e.location}`}
                    </p>
                    {e.description && <p className="mt-1 max-w-[70ch] text-sm">{e.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {p.educations.length > 0 && (
          <Section title="Education">
            <ul className="divide-y divide-border">
              {p.educations.map((e) => (
                <li key={e.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-[4px] bg-muted">
                    <GraduationCap className="size-6 text-muted-foreground" />
                  </span>
                  <div>
                    <p className="text-base font-semibold">{e.school}</p>
                    <p className="text-sm">{[e.degree, e.field].filter(Boolean).join(", ")}</p>
                    {e.startYear && (
                      <p className="tabular text-sm text-muted-foreground">
                        {e.startYear} – {e.endYear ?? "Present"}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {p.skills.length > 0 && (
          <Section title="Skills">
            <ul className="flex flex-wrap gap-2">
              {p.skills.map((s) => (
                <li key={s} className="rounded-full px-3 py-1 text-sm font-semibold shadow-[inset_0_0_0_1px_rgb(0_0_0/0.3)]">
                  {s}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      <aside className="hidden lg:block">
        <div className="card-surface space-y-3 p-4 lg:sticky lg:top-[76px]">
          <h2 className="text-base font-semibold">Profile language</h2>
          <p className="text-sm text-muted-foreground">English</p>
          <div className="border-t border-border pt-3">
            <h2 className="text-base font-semibold">Public profile &amp; URL</h2>
            <p className="mt-1 text-sm break-all text-muted-foreground">workvine.app/in/{p.handle}</p>
          </div>
          <div className="flex items-center gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
            <BriefcaseBusiness className="size-4" /> {p.industry ?? "Technology"}
          </div>
        </div>
      </aside>

      {p.isMe && editing && <EditIntro profile={p} open={editing} onOpenChange={setEditing} />}
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="card-surface px-4 py-5 sm:px-6" aria-label={title}>
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle && <p className="text-sm font-semibold text-primary">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function EditIntro({ profile, open, onOpenChange }: { profile: Profile; open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: profile.name,
    headline: profile.headline ?? "",
    location: profile.location ?? "",
    about: profile.about ?? "",
    openToWork: profile.openToWork,
  })
  const save = useMutation({
    mutationFn: () => api("/api/profile", { method: "PATCH", json: form }),
    onSuccess: () => {
      qc.setQueryData<Profile>(qk.profile(profile.handle), (d) => (d ? { ...d, ...form } : d))
      qc.invalidateQueries({ queryKey: qk.me })
      toast.success("Profile updated")
      onOpenChange(false)
    },
    onError: (e) => toast.error(e.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit intro</DialogTitle>
          <DialogDescription>* Indicates required</DialogDescription>
        </DialogHeader>
        <form
          id="edit-intro"
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            save.mutate()
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="name">Full name*</Label>
            <Input id="name" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="headline">Headline</Label>
            <Textarea id="headline" maxLength={220} value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="about">About</Label>
            <Textarea id="about" rows={5} maxLength={2600} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-[var(--success)]" checked={form.openToWork} onChange={(e) => setForm({ ...form, openToWork: e.target.checked })} />
            Show that I&apos;m open to work
          </label>
        </form>
        <DialogFooter>
          <Button type="submit" form="edit-intro" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
