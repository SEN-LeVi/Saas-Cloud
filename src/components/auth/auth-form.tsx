"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { signIn, signUp } from "@/lib/auth-client"
import { signInSchema, signUpSchema } from "@/lib/validators"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

type Mode = "login" | "signup"
type Errors = Partial<Record<"name" | "email" | "password" | "form", string>>

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const qc = useQueryClient()
  const [values, setValues] = useState({ name: "", email: "", password: "" })
  const [errors, setErrors] = useState<Errors>({})
  const [showPw, setShowPw] = useState(false)
  const [pending, setPending] = useState(false)

  async function submit(v = values) {
    setErrors({})
    const parsed = mode === "signup" ? signUpSchema.safeParse(v) : signInSchema.safeParse(v)
    if (!parsed.success) {
      const fe: Errors = {}
      for (const issue of parsed.error.issues) fe[issue.path[0] as keyof Errors] ??= issue.message
      setErrors(fe)
      return
    }
    setPending(true)
    const res =
      mode === "signup"
        ? await signUp.email({ name: v.name.trim(), email: v.email.trim(), password: v.password })
        : await signIn.email({ email: v.email.trim(), password: v.password })
    if (res.error && (!res.error.status || res.error.status >= 500)) {
      // Server-side failure: ask the health check what's wrong with the database.
      const health = await fetch("/api/health")
        .then((r) => r.json() as Promise<{ database: { ok: boolean; message?: string } }>)
        .catch(() => null)
      setPending(false)
      setErrors({
        form: health && !health.database.ok && health.database.message
          ? health.database.message
          : "The server couldn't complete the request. Check the terminal running `npm run dev` for details.",
      })
      return
    }
    setPending(false)
    if (res.error) {
      setErrors({
        form:
          res.error.status === 429
            ? "Too many attempts. Wait a few seconds and try again."
            : res.error.status === 401 || res.error.code === "INVALID_EMAIL_OR_PASSWORD"
              ? "That email and password don't match. Check them and try again."
              : res.error.message ?? "Something went wrong. Please try again.",
      })
      return
    }
    qc.clear()
    const next = new URLSearchParams(window.location.search).get("next")
    router.replace(next && next.startsWith("/") ? next : "/feed")
    router.refresh()
  }

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      {mode === "signup" && (
        <Field label="Full name" id="name" error={errors.name}>
          <input id="name" autoComplete="name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} className={fieldCls(errors.name)} />
        </Field>
      )}
      <Field label="Email" id="email" error={errors.email}>
        <input id="email" type="email" autoComplete="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} className={fieldCls(errors.email)} />
      </Field>
      <Field label={mode === "signup" ? "Password (8+ characters)" : "Password"} id="password" error={errors.password}>
        <div className="relative">
          <input
            id="password"
            type={showPw ? "text" : "password"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
            className={cn(fieldCls(errors.password), "pr-16")}
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold text-primary hover:bg-primary-soft"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      {mode === "login" && (
        <a href="#" className="inline-block rounded-full px-2 py-1 text-base font-semibold text-primary hover:bg-primary-soft hover:underline">
          Forgot password?
        </a>
      )}

      {errors.form && (
        <p role="alert" className="rounded-md bg-[#fdecec] px-3 py-2 text-sm text-destructive">
          {errors.form}
        </p>
      )}

      {mode === "signup" && (
        <p className="text-center text-xs text-muted-foreground">
          By clicking Agree &amp; Join, you agree to the Workvine <a href="#" className="font-semibold text-primary">User Agreement</a>,{" "}
          <a href="#" className="font-semibold text-primary">Privacy Policy</a>, and <a href="#" className="font-semibold text-primary">Cookie Policy</a>.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending && <Spinner className="size-5" />}
        {mode === "signup" ? "Agree & Join" : "Sign in"}
      </button>

      {mode === "login" && (
        <>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-px flex-1 bg-black/15" /> or <span className="h-px flex-1 bg-black/15" />
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              const demo = { name: "", email: "demo@workvine.dev", password: "Password123!" }
              setValues(demo)
              submit(demo)
            }}
            className="flex h-[52px] w-full items-center justify-center rounded-full text-base font-semibold text-subtle-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.6)] transition-[box-shadow,background-color] hover:bg-accent hover:shadow-[inset_0_0_0_2px_rgb(0_0_0/0.75)]"
          >
            Try the demo account
          </button>
        </>
      )}

      <p className="pt-2 text-center text-base">
        {mode === "signup" ? (
          <>
            Already on Workvine?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to Workvine?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Join now
            </Link>
          </>
        )}
      </p>
    </form>
  )
}

const fieldCls = (err?: string) =>
  cn(
    "h-12 w-full rounded-[4px] border bg-white px-3 text-base outline-none transition-[box-shadow,border-color]",
    err ? "border-destructive shadow-[inset_0_0_0_1px_var(--destructive)]" : "border-input focus:border-primary focus:shadow-[inset_0_0_0_1px_var(--primary)]"
  )

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-muted-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
