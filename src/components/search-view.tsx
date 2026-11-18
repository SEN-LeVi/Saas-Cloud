"use client"

import Link from "next/link"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { CompanyLogo, UserAvatar } from "@/components/user-avatar"
import { NotificationRowSkeleton } from "@/components/skeletons"
import { useSearch } from "@/hooks/queries"
import { useDebounced } from "@/hooks/use-debounced"

export function SearchView() {
  const params = useSearchParams()
  const [q, setQ] = useState(() => params.get("q") ?? "")
  const term = useDebounced(q.trim(), 250)
  const { data, isFetching } = useSearch(term)

  return (
    <div className="mx-auto max-w-[720px] space-y-2">
      <label className="card-surface relative block p-3">
        <span className="sr-only">Search</span>
        <Search className="pointer-events-none absolute top-1/2 left-6 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            const url = new URL(window.location.href)
            url.searchParams.set("q", e.target.value)
            window.history.replaceState(null, "", url)
          }}
          placeholder="Search people and jobs"
          className="h-10 w-full rounded-[4px] bg-search pr-3 pl-10 text-sm outline-none focus:shadow-[inset_0_0_0_2px_rgb(0_0_0/0.9)]"
        />
      </label>

      {!term ? (
        <p className="card-surface p-6 text-center text-sm text-muted-foreground">Search for members by name or headline, or jobs by title and company.</p>
      ) : isFetching && !data ? (
        <div className="card-surface">
          <NotificationRowSkeleton />
          <NotificationRowSkeleton />
          <NotificationRowSkeleton />
        </div>
      ) : (
        <>
          <section className="card-surface" aria-label="People">
            <h2 className="px-4 pt-4 pb-2 text-xl font-semibold">People</h2>
            {data?.people.length ? (
              <ul>
                {data.people.map((p) => (
                  <li key={p.id} className="border-t border-border">
                    <Link href={`/in/${p.handle}`} className="flex items-center gap-3 px-4 py-3 hover:bg-black/[0.03]">
                      <UserAvatar user={p} size={56} />
                      <span className="min-w-0">
                        <span className="block font-semibold text-primary hover:underline">{p.name}</span>
                        <span className="block truncate text-sm">{p.headline}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 pb-4 text-sm text-muted-foreground">No people match “{term}”.</p>
            )}
          </section>
          <section className="card-surface" aria-label="Jobs">
            <h2 className="px-4 pt-4 pb-2 text-xl font-semibold">Jobs</h2>
            {data?.jobs.length ? (
              <ul>
                {data.jobs.map((j) => (
                  <li key={j.id} className="border-t border-border">
                    <Link href="/jobs" className="flex items-center gap-3 px-4 py-3 hover:bg-black/[0.03]">
                      <CompanyLogo name={j.company} color={j.companyColor} size={48} />
                      <span className="min-w-0">
                        <span className="block font-semibold text-primary">{j.title}</span>
                        <span className="block truncate text-sm">
                          {j.company} · {j.location}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 pb-4 text-sm text-muted-foreground">No jobs match “{term}”.</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}
