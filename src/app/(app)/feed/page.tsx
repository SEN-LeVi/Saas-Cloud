import type { Metadata } from "next"
import { ProfileCard } from "@/components/feed/profile-card"
import { Composer } from "@/components/feed/composer"
import { FeedList } from "@/components/feed/feed-list"
import { NewsRail } from "@/components/feed/news-rail"

export const metadata: Metadata = { title: "Feed" }

export default function FeedPage() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[225px_1fr] lg:grid-cols-[225px_1fr_300px]">
      <aside className="hidden md:block" aria-label="Your profile">
        <ProfileCard />
      </aside>
      <section aria-label="Feed" className="min-w-0 space-y-2">
        <Composer />
        <div className="flex items-center gap-2 px-1 py-1 text-xs text-muted-foreground" aria-hidden="true">
          <span className="h-px flex-1 bg-black/15" />
          Sort by: <span className="font-semibold text-foreground">Recent</span>
        </div>
        <FeedList />
      </section>
      <aside className="hidden lg:block" aria-label="News">
        <NewsRail />
      </aside>
    </div>
  )
}
