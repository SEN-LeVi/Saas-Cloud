"use client"

import dynamic from "next/dynamic"
import { ChevronUp, Sparkles } from "lucide-react"
import { setAssistantOpen, useAssistantOpen, useSelectedModel } from "./assistant-store"
import { getModelInfo } from "@/lib/ai-models"
import { Skeleton } from "@/components/ui/skeleton"

// The chat panel (AI SDK + streaming UI) is code-split and only downloaded when opened.
const AssistantPanel = dynamic(() => import("./assistant-panel"), {
  ssr: false,
  loading: () => (
    <div className="space-y-3 p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-16 w-full" />
    </div>
  ),
})

/** Docked panel in the bottom-right corner, styled like the reference's messaging overlay. */
export function AssistantDock() {
  const open = useAssistantOpen()
  const model = getModelInfo(useSelectedModel())

  return (
    <aside
      aria-label="Workvine AI assistant"
      className={`fixed bottom-0 z-50 flex-col overflow-hidden rounded-t-lg bg-white shadow-float sm:right-2 sm:left-auto sm:flex sm:w-[360px] ${open ? "inset-x-0 flex" : "hidden"}`}
    >
      <button
        type="button"
        onClick={() => setAssistantOpen(!open)}
        aria-expanded={open}
        className="flex h-12 items-center gap-2 border-b border-border px-3 text-left hover:bg-muted"
      >
        <span className="relative inline-flex size-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0a66c2,#7a3ff2)] text-white">
          <Sparkles className="size-4" />
          <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full bg-success ring-2 ring-white" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="text-sm font-semibold">Workvine AI</span>
          <span className="truncate text-xs text-muted-foreground" data-testid="ai-header-model">
            {model.label}
          </span>
        </span>
        <ChevronUp className={`size-5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="h-[min(560px,calc(100dvh-120px))]">
          <AssistantPanel />
        </div>
      )}
    </aside>
  )
}
