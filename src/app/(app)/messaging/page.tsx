import type { Metadata } from "next"
import { MessagingView } from "@/components/messaging/messaging-view"

export const metadata: Metadata = { title: "Messaging" }

export default function MessagingPage() {
  return <MessagingView />
}
