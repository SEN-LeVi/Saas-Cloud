import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { GuestHeader } from "@/components/landing/guest-header"
import { HeroIllustration, PeopleIllustration } from "@/components/landing/illustrations"
import { LogoMark } from "@/components/brand/logo"

const TOPICS = ["Career", "Productivity", "Finance", "Soft Skills & Emotional Intelligence", "Project Management", "Education", "Technology", "Leadership", "Ecommerce"]
const JOB_CATEGORIES = ["Engineering", "Business Development", "Finance", "Administrative Assistant", "Retail Associate", "Customer Service", "Operations", "Information Technology", "Marketing", "Human Resources"]
const WHO = ["Find a coworker or classmate", "Find a new job", "Find a course or training"]
const FOOTER = {
  General: ["Sign Up", "Help Center", "About", "Careers", "Developers"],
  "Browse Workvine": ["Learning", "Jobs", "Games", "Salary", "Mobile"],
  "Business Solutions": ["Talent", "Marketing", "Sales", "Learning"],
  Directories: ["Members", "Jobs", "Companies", "Featured", "Learning"],
}

const pill =
  "inline-flex h-[35px] items-center rounded-full px-4 text-sm font-semibold text-subtle-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.75)] transition-[box-shadow,background-color] hover:bg-accent hover:shadow-[inset_0_0_0_2px_rgb(0_0_0/0.75)]"

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white">
      <GuestHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-[1128px] items-center gap-8 px-4 pt-6 pb-12 md:grid-cols-[1fr_1fr] lg:px-0 lg:pt-10">
          <div className="max-w-[480px]">
            <h1 className="text-[32px] leading-10 font-normal text-balance text-black/90 md:text-[52px] md:leading-[1.15] md:font-extralight md:tracking-[-0.02em]">
              Welcome to your professional community
            </h1>
            <div className="mt-8 flex max-w-[400px] flex-col gap-3">
              <Link
                href="/signup"
                className="flex h-14 items-center justify-center rounded-full bg-primary text-base font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Join now — it&apos;s free
              </Link>
              <Link
                href="/login"
                className="flex h-14 items-center justify-center rounded-full text-base font-semibold text-subtle-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.6)] transition-[box-shadow,background-color] hover:bg-accent hover:shadow-[inset_0_0_0_2px_rgb(0_0_0/0.75)]"
              >
                Sign in with email
              </Link>
              <p className="mt-1 text-center text-xs leading-[18px] text-muted-foreground">
                By clicking Continue to join or sign in, you agree to Workvine&apos;s{" "}
                <a href="#" className="font-semibold text-primary hover:underline">User Agreement</a>,{" "}
                <a href="#" className="font-semibold text-primary hover:underline">Privacy Policy</a>, and{" "}
                <a href="#" className="font-semibold text-primary hover:underline">Cookie Policy</a>.
              </p>
              <p className="mt-4 text-center text-base">
                New to Workvine?{" "}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                  Join now
                </Link>
              </p>
            </div>
          </div>
          <HeroIllustration className="mx-auto w-full max-w-[560px]" />
        </section>

        {/* Explore content */}
        <section className="bg-[#f3f2ef]">
          <div className="mx-auto grid max-w-[1128px] gap-6 px-4 py-14 md:grid-cols-[360px_1fr] lg:px-0">
            <div>
              <h2 className="text-2xl leading-8 font-light text-black/90 md:text-[32px] md:leading-10">Explore top Workvine content</h2>
              <p className="mt-3 text-base text-subtle-foreground">Discover relevant posts and expert insights — curated by topic and in one place.</p>
            </div>
            <ul className="flex flex-wrap content-start gap-x-2 gap-y-3">
              {TOPICS.map((t) => (
                <li key={t}>
                  <Link href="/login" className={pill}>{t}</Link>
                </li>
              ))}
              <li>
                <Link href="/login" className="inline-flex h-[35px] items-center rounded-full px-4 text-sm font-semibold text-primary shadow-[inset_0_0_0_1px_var(--primary)] hover:bg-primary-soft">
                  Show all
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {/* Jobs */}
        <section className="mx-auto grid max-w-[1128px] gap-6 px-4 py-14 md:grid-cols-[360px_1fr] lg:px-0">
          <h2 className="text-2xl leading-8 font-light text-black/90 md:text-[32px] md:leading-10">Find the right job or internship for you</h2>
          <div>
            <p className="mb-3 text-sm font-semibold text-muted-foreground">Suggested searches</p>
            <ul className="flex flex-wrap gap-x-2 gap-y-3">
              {JOB_CATEGORIES.map((t) => (
                <li key={t}>
                  <Link href="/login" className={pill}>{t}</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Post a job */}
        <section className="bg-[#f1ece5]">
          <div className="mx-auto flex max-w-[1128px] flex-col items-start justify-between gap-6 px-4 py-14 md:flex-row md:items-center lg:px-0">
            <h2 className="text-2xl leading-8 font-light text-rust md:text-[32px] md:leading-10">Post your job for millions of people to see</h2>
            <Link href="/signup" className="flex h-12 shrink-0 items-center rounded-full px-6 text-base font-semibold text-primary shadow-[inset_0_0_0_1px_var(--primary)] hover:bg-primary-soft hover:shadow-[inset_0_0_0_2px_var(--primary)]">
              Post a job
            </Link>
          </div>
        </section>

        {/* Connect */}
        <section className="mx-auto grid max-w-[1128px] items-center gap-10 px-4 py-14 md:grid-cols-2 lg:px-0">
          <div>
            <PeopleIllustration className="w-full max-w-[360px]" />
            <h2 className="mt-6 text-2xl leading-8 font-light md:text-[32px] md:leading-10">Connect with people who can help</h2>
            <Link href="/signup" className="mt-6 inline-flex h-12 items-center rounded-full px-6 text-base font-semibold text-subtle-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.75)] hover:bg-accent">
              Find people you know
            </Link>
          </div>
          <div>
            <h2 className="text-2xl leading-8 font-light text-rust md:text-[32px] md:leading-10">Who is Workvine for?</h2>
            <p className="mt-2 text-xl font-light text-subtle-foreground">Anyone looking to navigate their professional life.</p>
            <ul className="mt-6 space-y-2">
              {WHO.map((w) => (
                <li key={w}>
                  <Link href="/signup" className="flex items-center justify-between rounded-lg bg-[#f3f2ef] px-5 py-4 text-lg font-semibold text-subtle-foreground transition-colors hover:bg-[#e9e5df]">
                    {w} <ChevronRight className="size-5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Join CTA */}
        <section className="bg-[#f3f2ef]">
          <div className="mx-auto flex max-w-[1128px] flex-col items-start gap-6 px-4 py-16 lg:px-0">
            <h2 className="max-w-[640px] text-[32px] leading-10 font-extralight text-black/90 md:text-[48px] md:leading-[1.15]">
              Join your colleagues, classmates, and friends on Workvine.
            </h2>
            <Link href="/signup" className="flex h-14 items-center rounded-full bg-primary px-8 text-base font-semibold text-white hover:bg-primary-hover">
              Get started
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-[1128px] px-4 py-10 lg:px-0">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-[1.2fr_repeat(4,1fr)]">
          <LogoMark className="size-7" />
          {Object.entries(FOOTER).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-base font-semibold">{title}</h3>
              <ul className="mt-2 space-y-1">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-base text-muted-foreground hover:text-primary hover:underline">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          <span className="font-bold text-primary">Workvine</span> © 2026 · About · Accessibility · User Agreement · Privacy Policy · Cookie Policy
        </p>
      </footer>
    </div>
  )
}
