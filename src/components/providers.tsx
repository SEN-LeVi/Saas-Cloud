"use client"

import { useState } from "react"
import { QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

export const CACHE_KEY = "workvine-cache-v1"
const DAY = 1000 * 60 * 60 * 24

/**
 * Data caching strategy ("load once, reuse on revisit"):
 *  - TanStack Query keeps every visited page's data in memory (gcTime 24h).
 *  - The cache is persisted to localStorage, so revisits — even after a reload — render
 *    instantly from cache with no skeleton, then refresh quietly in the background.
 *  - Skeletons only show on the very first visit of a page.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: DAY,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  })
}

function makePersister() {
  if (typeof window === "undefined") return noopPersister
  return createSyncStoragePersister({ storage: window.localStorage, key: CACHE_KEY, throttleTime: 1000 })
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient)
  const [persister] = useState(makePersister)

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: DAY,
        buster: "1",
        dehydrateOptions: { shouldDehydrateQuery: (q) => q.state.status === "success" && q.queryKey[0] !== "ai" },
      }}
    >
      <TooltipProvider delayDuration={300}>
        {children}
        <Toaster position="bottom-left" />
      </TooltipProvider>
    </PersistQueryClientProvider>
  )
}

const noopPersister = {
  persistClient: async () => {},
  restoreClient: async () => undefined,
  removeClient: async () => {},
}
