import type { Metadata } from "next"
import { Suspense } from "react"
import { SearchView } from "@/components/search-view"
import { NotificationsPageSkeleton } from "@/components/skeletons"

export const metadata: Metadata = { title: "Search" }

export default function SearchPage() {
  return (
    <Suspense fallback={<NotificationsPageSkeleton />}>
      <SearchView />
    </Suspense>
  )
}
