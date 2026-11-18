import type { Metadata } from "next"
import { Suspense } from "react"
import { ProfileView } from "@/components/profile/profile-view"
import { ProfilePageSkeleton } from "@/components/skeletons"

export const metadata: Metadata = { title: "Profile" }

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfilePageSkeleton />}>
      <ProfileView />
    </Suspense>
  )
}
