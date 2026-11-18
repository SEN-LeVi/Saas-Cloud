import type { Metadata } from "next"
import { AuthForm } from "@/components/auth/auth-form"

export const metadata: Metadata = { title: "Sign in" }

export default function LoginPage() {
  return (
    <div className="mx-auto mt-4 w-full max-w-[400px] rounded-lg bg-white p-6 shadow-raised">
      <h1 className="text-[32px] leading-10 font-semibold">Sign in</h1>
      <p className="mt-1 mb-6 text-sm">Stay updated on your professional world</p>
      <AuthForm mode="login" />
    </div>
  )
}
