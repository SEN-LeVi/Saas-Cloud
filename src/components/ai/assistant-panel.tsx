"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { useQuery } from "@tanstack/react-query"
import { DefaultChatTransport } from "ai"
import { ArrowUp, RotateCcw, Sparkles, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/fetcher"
import { getModelInfo } from "@/lib/ai-models"
import { getSelectedModel, useSelectedModel } from "./assistant-store"
import { ModelPicker } from "./model-picker"

const STARTERS = [
  "Rewrite my headline to stand out to recruiters",
  "Draft a post about a project I just shipped",
  "Help me prepare for a backend interview",
  "Write a short note to connect with a hiring manager",
]

export default function AssistantPanel() {
  const [input, setInput] = useState("")
  const endRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, status, stop, error, regenerate, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/chat" }),
  })
  const busy = status === "submitted" || status === "streaming"
  const model = useSelectedModel()
  // Server reports whether OPENROUTER_API_KEY is set (never the key itself).
  const { data: aiStatus } = useQuery({
    queryKey: ["ai", "status"],
    queryFn: () => api<{ configured: boolean; message: string | null }>("/api/ai/status"),
    staleTime: 30_000,
  })
  const notConfigured = aiStatus?.configured === false

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" })
  }, [messages, status])

  function send(text: string) {
    const t = text.trim()
    if (!t || busy || notConfigured) return
    // Each message goes to the model selected at the moment it is sent.
    sendMessage({ text: t }, { body: { model: getSelectedModel() } })
    setInput("")
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <ModelPicker disabled={busy} />
        <span className="truncate text-xs text-muted-foreground">{getModelInfo(model).description}</span>
      </div>
      {notConfigured && (
        <div role="alert" className="mx-3 mt-3 rounded-md bg-[#fdf3e1] px-3 py-2 text-sm text-[#7a4a00]">
          {aiStatus?.message}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ask for help with posts, your profile, interviews or outreach. Answers are drafts: review them before you share.
            </p>
            <div className="flex flex-col items-start gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  disabled={notConfigured}
                  className="rounded-full px-3 py-1.5 text-left text-sm font-semibold text-primary shadow-[inset_0_0_0_1px_var(--primary)] hover:bg-primary-soft disabled:pointer-events-none disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ol className="space-y-3">
            {messages.map((m) => (
              <li key={m.id} className={m.role === "user" ? "flex justify-end" : "flex gap-2"}>
                {m.role !== "user" && (
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <Sparkles className="size-3.5" />
                  </span>
                )}
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm whitespace-pre-wrap text-white"
                      : "max-w-[90%] text-sm leading-relaxed whitespace-pre-wrap"
                  }
                >
                  {m.parts.map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null))}
                </div>
              </li>
            ))}
            {status === "submitted" && (
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner className="size-4" /> Thinking…
              </li>
            )}
          </ol>
        )}
        {error && (
          <div role="alert" className="mt-3 rounded-md bg-[#fdecec] p-3 text-sm text-destructive">
            {readError(error)}
            <button type="button" onClick={() => regenerate({ body: { model: getSelectedModel() } })} className="ml-2 font-semibold underline">
              Try again
            </button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send(input)
              }
            }}
            rows={1}
            placeholder="Ask Workvine AI…"
            aria-label="Message Workvine AI"
            className="max-h-32 min-h-10 flex-1 resize-none rounded-lg bg-muted px-3 py-2 text-sm outline-none field-sizing-content focus:shadow-[inset_0_0_0_1px_var(--primary)]"
          />
          {busy ? (
            <Button type="button" size="icon-sm" variant="secondary" onClick={() => stop()} aria-label="Stop">
              <Square className="size-3.5" fill="currentColor" />
            </Button>
          ) : (
            <Button type="submit" size="icon-sm" disabled={!input.trim() || notConfigured} aria-label="Send">
              <ArrowUp />
            </Button>
          )}
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => setMessages([])}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3" /> New chat
          </button>
        )}
      </form>
    </div>
  )
}

function readError(error: Error) {
  try {
    const parsed = JSON.parse(error.message) as { error?: string }
    if (parsed.error) return parsed.error
  } catch {}
  return error.message || "The assistant couldn't answer. Please try again."
}
