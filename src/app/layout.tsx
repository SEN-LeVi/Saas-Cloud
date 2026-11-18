import type { Metadata, Viewport } from "next"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "Workvine: Your professional community", template: "%s | Workvine" },
  description: "Connect with colleagues, find jobs, and grow your career on Workvine.",
}

export const viewport: Viewport = {
  themeColor: "#f4f2ee",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
