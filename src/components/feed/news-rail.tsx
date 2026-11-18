import { Info } from "lucide-react"

const STORIES = [
  { title: "Remote hiring picks up for engineers", meta: "Top news • 4,812 readers" },
  { title: "Why small teams are winning at SaaS", meta: "2h ago • 2,139 readers" },
  { title: "AI copilots reshape code review", meta: "5h ago • 9,402 readers" },
  { title: "The skills employers want in 2027", meta: "1d ago • 12,871 readers" },
  { title: "Startup funding steadies this quarter", meta: "1d ago • 3,205 readers" },
]

const FOOTER = ["About", "Accessibility", "Help Center", "Privacy & Terms", "Advertising", "Business Services", "Get the app"]

export function NewsRail() {
  return (
    <div className="space-y-2 lg:sticky lg:top-[76px]">
      <section className="card-surface py-3" aria-labelledby="news-title">
        <div className="flex items-center justify-between px-4">
          <h2 id="news-title" className="text-base font-semibold">
            Workvine News
          </h2>
          <Info className="size-4 text-foreground" />
        </div>
        <p className="mt-2 px-4 text-sm font-semibold text-muted-foreground">Top stories</p>
        <ul className="mt-1">
          {STORIES.map((s) => (
            <li key={s.title}>
              <a href="#" className="block px-4 py-1.5 hover:bg-accent">
                <span className="line-clamp-1 text-sm font-semibold">{s.title}</span>
                <span className="text-xs text-muted-foreground">{s.meta}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      <footer className="px-4 pt-2 text-center text-xs text-muted-foreground">
        <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          {FOOTER.map((f) => (
            <li key={f}>
              <a href="#" className="hover:text-primary hover:underline">
                {f}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-center justify-center gap-1">
          <span className="font-bold text-primary">Workvine</span> Corporation © 2026
        </p>
      </footer>
    </div>
  )
}
