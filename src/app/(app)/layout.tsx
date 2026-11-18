import { TopNav } from "@/components/shell/top-nav"
import { AssistantDock } from "@/components/ai/assistant-dock"

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-[1128px] px-0 pt-6 pb-16 sm:px-3 lg:px-0">{children}</main>
      <AssistantDock />
    </>
  )
}
