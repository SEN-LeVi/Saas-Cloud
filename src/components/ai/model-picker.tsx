"use client"

import { ChevronDown, Cpu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AI_MODELS, getModelInfo, isAllowedModel } from "@/lib/ai-models"
import { setSelectedModel, useSelectedModel } from "./assistant-store"

/** Dropdown with exactly the 3 configured free models. The choice persists across chats. */
export function ModelPicker({ disabled }: { disabled?: boolean }) {
  const model = useSelectedModel()
  const current = getModelInfo(model)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        aria-label={`AI model: ${current.label}. Change model`}
        className="flex h-8 max-w-full items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-subtle-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.6)] transition-[box-shadow,background-color] outline-none hover:bg-accent hover:shadow-[inset_0_0_0_2px_rgb(0_0_0/0.75)] disabled:opacity-50"
      >
        <Cpu className="size-4 shrink-0" />
        <span className="truncate">{current.name}</span>
        <ChevronDown className="size-4 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 rounded-lg p-1 shadow-float">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Free models via OpenRouter</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={model}
          onValueChange={(v) => {
            if (isAllowedModel(v)) setSelectedModel(v)
          }}
        >
          {AI_MODELS.map((m) => (
            <DropdownMenuRadioItem key={m.id} value={m.id} className="items-start py-2">
              <span className="flex flex-col">
                <span className="text-sm font-semibold">{m.label}</span>
                <span className="text-xs text-muted-foreground">{m.description}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
