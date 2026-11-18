import type { Metadata } from "next"
import { AuthForm } from "@/components/auth/auth-form"

export const metadata: Metadata = { title: "Join" }

export default function SignupPage() {
  return (
    <>
      <h1 className="mx-auto max-w-[640px] pt-2 pb-6 text-center text-[32px] leading-10 font-normal text-black/90">
        Make the most of your professional life
      </h1>
      <div className="mx-auto w-full max-w-[400px] rounded-lg bg-white p-6 shadow-raised">
        <AuthForm mode="signup" />
      </div>
    </>
  )
}
