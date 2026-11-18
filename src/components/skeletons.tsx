import { Skeleton } from "@/components/ui/skeleton"

export function ProfileCardSkeleton() {
  return (
    <div className="card-surface overflow-hidden">
      <Skeleton className="h-14 rounded-none" />
      <div className="-mt-9 px-3 pb-4">
        <Skeleton className="size-[72px] rounded-full ring-4 ring-white" />
        <Skeleton className="mt-3 h-5 w-2/3" />
        <Skeleton className="mt-2 h-3.5 w-full" />
        <Skeleton className="mt-1.5 h-3.5 w-4/5" />
      </div>
      <div className="space-y-2 border-t border-border p-3">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-full" />
      </div>
    </div>
  )
}

export function PostSkeleton() {
  return (
    <div className="card-surface p-4">
      <div className="flex gap-2">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3 w-64 max-w-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-11/12" />
        <Skeleton className="h-3.5 w-3/5" />
      </div>
      <div className="mt-5 flex justify-between border-t border-border pt-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-16" />
        ))}
      </div>
    </div>
  )
}

export function ComposerSkeleton() {
  return (
    <div className="card-surface p-4">
      <div className="flex gap-2">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-12 flex-1 rounded-full" />
      </div>
      <div className="mt-3 flex justify-around">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  )
}

export function RailSkeleton() {
  return (
    <div className="card-surface space-y-3 p-4">
      <Skeleton className="h-5 w-1/2" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3.5 w-11/12" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}

export function FeedPageSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[225px_1fr] lg:grid-cols-[225px_1fr_300px]">
      <div className="hidden md:block">
        <ProfileCardSkeleton />
      </div>
      <div className="space-y-2">
        <ComposerSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
      <div className="hidden lg:block">
        <RailSkeleton />
      </div>
    </div>
  )
}

export function PersonCardSkeleton() {
  return (
    <div className="card-surface overflow-hidden">
      <Skeleton className="h-14 rounded-none" />
      <div className="-mt-10 flex flex-col items-center px-3 pb-3">
        <Skeleton className="size-[104px] rounded-full ring-4 ring-white" />
        <Skeleton className="mt-3 h-4 w-28" />
        <Skeleton className="mt-2 h-3 w-36" />
        <Skeleton className="mt-1 h-3 w-24" />
        <Skeleton className="mt-6 h-8 w-full rounded-full" />
      </div>
    </div>
  )
}

export function NetworkPageSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
      <div className="hidden md:block">
        <RailSkeleton />
      </div>
      <div className="space-y-2">
        <div className="card-surface space-y-4 p-4">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          ))}
        </div>
        <div className="card-surface grid grid-cols-2 gap-3 p-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <PersonCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function JobRowSkeleton() {
  return (
    <div className="flex gap-3 border-b border-border px-4 py-3">
      <Skeleton className="size-14 rounded-[4px]" />
      <div className="flex-1 space-y-2 pt-0.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/5" />
      </div>
    </div>
  )
}

export function JobsPageSkeleton() {
  return (
    <div className="card-surface grid min-h-[70dvh] grid-cols-1 overflow-hidden md:grid-cols-[400px_1fr]">
      <div className="border-r border-border">
        {Array.from({ length: 7 }).map((_, i) => (
          <JobRowSkeleton key={i} />
        ))}
      </div>
      <div className="hidden space-y-3 p-6 md:block">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-6 h-10 w-40 rounded-full" />
        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}

export function ConversationRowSkeleton() {
  return (
    <div className="flex gap-2 px-3 py-3">
      <Skeleton className="size-14 rounded-full" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  )
}

export function MessagingPageSkeleton() {
  return (
    <div className="card-surface grid h-[calc(100dvh-140px)] min-h-[480px] grid-cols-1 overflow-hidden md:grid-cols-[340px_1fr]">
      <div className="border-r border-border">
        {Array.from({ length: 7 }).map((_, i) => (
          <ConversationRowSkeleton key={i} />
        ))}
      </div>
      <div className="hidden flex-col gap-4 p-6 md:flex">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-2/3 rounded-2xl" />
        <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
        <Skeleton className="h-10 w-3/5 rounded-2xl" />
      </div>
    </div>
  )
}

export function NotificationRowSkeleton() {
  return (
    <div className="flex gap-3 border-b border-border px-4 py-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  )
}

export function NotificationsPageSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[225px_1fr] lg:grid-cols-[225px_1fr_300px]">
      <div className="hidden md:block">
        <RailSkeleton />
      </div>
      <div className="card-surface overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <NotificationRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function ProfilePageSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-2">
        <div className="card-surface overflow-hidden">
          <Skeleton className="h-[200px] rounded-none" />
          <div className="-mt-24 px-6 pb-6">
            <Skeleton className="size-[152px] rounded-full ring-4 ring-white" />
            <Skeleton className="mt-4 h-7 w-56" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <Skeleton className="mt-2 h-3.5 w-1/3" />
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </div>
        </div>
        <div className="card-surface space-y-2 p-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
        </div>
      </div>
      <div className="hidden lg:block">
        <RailSkeleton />
      </div>
    </div>
  )
}
