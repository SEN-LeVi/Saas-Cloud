import { Logo } from "@/components/brand/logo"

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh bg-[#f3f2ef]">
      <header className="mx-auto flex h-[72px] max-w-[1128px] items-center px-4 lg:px-0">
        <Logo withWordmark />
      </header>
      <main className="px-4 pb-16">{children}</main>
    </div>
  )
}
