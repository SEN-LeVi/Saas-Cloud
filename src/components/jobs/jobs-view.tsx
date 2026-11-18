"use client"

import { useEffect, useRef, useState } from "react"
import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Bookmark, BriefcaseBusiness, Check, MapPin, Search, Users } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { CompanyLogo } from "@/components/user-avatar"
import { JobRowSkeleton, JobsPageSkeleton } from "@/components/skeletons"
import { qk, useJobs } from "@/hooks/queries"
import { useDebounced, useMediaQuery } from "@/hooks/use-debounced"
import { api } from "@/lib/fetcher"
import { compactNumber, timeAgo, TYPE_LABEL, WORKPLACE_LABEL } from "@/lib/format"
import type { JobItem, Page } from "@/lib/types"
import { cn } from "@/lib/utils"

const FILTERS = [
  { value: "", label: "All" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ON_SITE", label: "On-site" },
] as const

export function JobsView() {
  const [query, setQuery] = useState("")
  const [workplace, setWorkplace] = useState("")
  const q = useDebounced(query.trim(), 300)
  const { data, isPending, isError, error, hasNextPage, fetchNextPage, isFetchingNextPage, refetch } = useJobs(q, workplace)
  const jobs = data?.pages.flatMap((p) => p.items) ?? []
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [sheetOpen, setSheetOpen] = useState(false)
  const selected = jobs.find((j) => j.id === selectedId) ?? (isDesktop ? jobs[0] : undefined)

  const scrollRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: hasNextPage ? jobs.length + 1 : jobs.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 104,
    overscan: 6,
    getItemKey: (i) => jobs[i]?.id ?? "loader",
  })
  const rows = virtualizer.getVirtualItems()
  const last = rows[rows.length - 1]
  useEffect(() => {
    if (last && last.index >= jobs.length - 3 && hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [last, jobs.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="space-y-2">
      <div className="card-surface flex flex-wrap items-center gap-2 p-3">
        <label className="relative min-w-60 flex-1">
          <span className="sr-only">Search jobs</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title, skill or company"
            className="h-10 w-full rounded-[4px] bg-search pr-3 pl-9 text-sm outline-none placeholder:text-subtle-foreground focus:shadow-[inset_0_0_0_2px_rgb(0_0_0/0.9)]"
          />
        </label>
        <div className="flex gap-2" role="radiogroup" aria-label="Workplace type">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="radio"
              aria-checked={workplace === f.value}
              onClick={() => setWorkplace(f.value)}
              className={cn(
                "h-8 rounded-full px-3 text-sm font-semibold transition-colors",
                workplace === f.value
                  ? "bg-success text-white"
                  : "text-muted-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.6)] hover:bg-accent hover:shadow-[inset_0_0_0_2px_rgb(0_0_0/0.75)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isPending ? (
        <JobsPageSkeleton />
      ) : isError ? (
        <div className="card-surface p-6 text-center">
          <p className="font-semibold">We couldn&apos;t load jobs.</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="card-surface grid h-[calc(100dvh-170px)] min-h-[480px] grid-cols-1 overflow-hidden md:grid-cols-[400px_1fr]">
          <div className="flex min-h-0 flex-col border-r border-border">
            <div className="border-b border-border px-4 py-3">
              <h1 className="text-base font-semibold">{q ? `Jobs matching “${q}”` : "Top job picks for you"}</h1>
              <p className="text-xs text-muted-foreground">Based on your profile and search history</p>
            </div>
            {jobs.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No jobs match that search. Try a broader title or clear the filters.</p>
            ) : (
              <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
                <ul style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
                  {rows.map((row) => {
                    const job = jobs[row.index]
                    return (
                      <li
                        key={row.key}
                        data-index={row.index}
                        ref={virtualizer.measureElement}
                        className="absolute inset-x-0 top-0"
                        style={{ transform: `translateY(${row.start}px)` }}
                      >
                        {job ? (
                          <JobRow
                            job={job}
                            active={selected?.id === job.id}
                            onSelect={() => {
                              setSelectedId(job.id)
                              if (!isDesktop) setSheetOpen(true)
                            }}
                          />
                        ) : (
                          <JobRowSkeleton />
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
          <div className="hidden min-h-0 overflow-y-auto md:block">{selected && <JobDetail job={selected} queryKey={qk.jobs(q, workplace)} />}</div>
        </div>
      )}

      <Sheet open={sheetOpen && !isDesktop} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[88dvh] overflow-y-auto rounded-t-xl p-0">
          <SheetTitle className="sr-only">{selected?.title ?? "Job details"}</SheetTitle>
          <SheetDescription className="sr-only">Job details</SheetDescription>
          {selected && <JobDetail job={selected} queryKey={qk.jobs(q, workplace)} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function JobRow({ job, active, onSelect }: { job: JobItem; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cn(
        "relative flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-black/[0.03]",
        active && "bg-primary-soft after:absolute after:inset-y-0 after:left-0 after:w-0.5 after:bg-primary hover:bg-primary-soft"
      )}
    >
      <CompanyLogo name={job.company} color={job.companyColor} size={56} />
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-base leading-5 font-semibold text-primary">{job.title}</span>
        <span className="block truncate text-sm">{job.company}</span>
        <span className="block truncate text-sm text-muted-foreground">
          {job.location} ({WORKPLACE_LABEL[job.workplace]})
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          {job.applied ? (
            <span className="flex items-center gap-1 font-semibold text-success">
              <Check className="size-3" /> Applied
            </span>
          ) : (
            <span>{timeAgo(job.createdAt)} ago</span>
          )}
          {job.saved && (
            <span className="flex items-center gap-0.5">
              • <Bookmark className="size-3" fill="currentColor" /> Saved
            </span>
          )}
        </span>
      </span>
    </button>
  )
}

function JobDetail({ job, queryKey }: { job: JobItem; queryKey: readonly unknown[] }) {
  const qc = useQueryClient()
  const patch = (fn: (j: JobItem) => JobItem) =>
    qc.setQueryData<InfiniteData<Page<JobItem>>>(queryKey, (d) =>
      d ? { ...d, pages: d.pages.map((p) => ({ ...p, items: p.items.map((j) => (j.id === job.id ? fn(j) : j)) })) } : d
    )

  const save = useMutation({
    mutationFn: () => api<{ saved: boolean }>(`/api/jobs/${job.id}/save`, { method: "POST" }),
    onMutate: () => patch((j) => ({ ...j, saved: !j.saved })),
    onSuccess: (r) => toast.success(r.saved ? "Job saved" : "Removed from saved jobs"),
    onError: (e) => {
      patch((j) => ({ ...j, saved: !j.saved }))
      toast.error(e.message)
    },
  })
  const apply = useMutation({
    mutationFn: () => api(`/api/jobs/${job.id}/apply`, { method: "POST" }),
    onSuccess: () => {
      patch((j) => ({ ...j, applied: true, applicants: j.applicants + 1 }))
      toast.success(`Application sent to ${job.company}`)
      qc.invalidateQueries({ queryKey: qk.notifications })
      qc.invalidateQueries({ queryKey: qk.me })
    },
    onError: (e) => toast.error(e.message),
  })

  return (
    <article className="p-6" aria-labelledby={`job-${job.id}`}>
      <div className="flex items-center gap-2">
        <CompanyLogo name={job.company} color={job.companyColor} size={32} />
        <span className="text-sm font-semibold">{job.company}</span>
      </div>
      <h2 id={`job-${job.id}`} className="mt-3 text-2xl leading-8 font-semibold text-balance">
        {job.title}
      </h2>
      <p className="mt-1 flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
        <MapPin className="size-3.5" /> {job.location} · {timeAgo(job.createdAt)} ago ·{" "}
        <span className="tabular">{compactNumber(job.applicants)} applicants</span>
      </p>
      <ul className="mt-3 flex flex-wrap gap-2 text-sm">
        <li className="flex items-center gap-1 rounded-[4px] bg-[#dcebdc] px-2 py-0.5 font-semibold text-[#1d4d1f]">
          {WORKPLACE_LABEL[job.workplace]}
        </li>
        <li className="flex items-center gap-1 rounded-[4px] bg-[#dcebdc] px-2 py-0.5 font-semibold text-[#1d4d1f]">
          <BriefcaseBusiness className="size-3.5" /> {TYPE_LABEL[job.type]}
        </li>
        {job.salary && <li className="rounded-[4px] bg-muted px-2 py-0.5 font-semibold">{job.salary}</li>}
      </ul>
      <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Users className="size-4" /> See how you compare to {compactNumber(job.applicants)} applicants
      </p>
      <div className="mt-4 flex gap-2">
        <Button size="md" disabled={job.applied || apply.isPending} onClick={() => apply.mutate()}>
          {job.applied ? (
            <>
              <Check /> Applied
            </>
          ) : apply.isPending ? (
            "Sending…"
          ) : (
            "Easy Apply"
          )}
        </Button>
        <Button size="md" variant="outline" onClick={() => save.mutate()} aria-pressed={job.saved}>
          <Bookmark fill={job.saved ? "currentColor" : "none"} /> {job.saved ? "Saved" : "Save"}
        </Button>
      </div>
      <section className="mt-8 border-t border-border pt-6">
        <h3 className="text-xl font-semibold">About the job</h3>
        <p className="mt-3 max-w-[70ch] text-sm leading-6 whitespace-pre-line">{job.description}</p>
      </section>
    </article>
  )
}
