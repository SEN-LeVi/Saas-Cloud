"use client"

import { useSyncExternalStore } from "react"
import { DEFAULT_MODEL_ID, isAllowedModel, type AiModelId } from "@/lib/ai-models"

// ─── Panel open/closed ───
let open = false
const openListeners = new Set<() => void>()
const emitOpen = () => openListeners.forEach((l) => l())

export function openAssistant() {
  open = true
  emitOpen()
}
export function setAssistantOpen(value: boolean) {
  open = value
  emitOpen()
}
export function useAssistantOpen() {
  return useSyncExternalStore(
    (cb) => {
      openListeners.add(cb)
      return () => openListeners.delete(cb)
    },
    () => open,
    () => false
  )
}

// ─── Selected model (persisted, shared by every conversation) ───
const MODEL_KEY = "workvine-ai-model"
let model: AiModelId | null = null
const modelListeners = new Set<() => void>()

function readModel(): AiModelId {
  if (model) return model
  try {
    const saved = localStorage.getItem(MODEL_KEY)
    model = isAllowedModel(saved) ? saved : DEFAULT_MODEL_ID
  } catch {
    model = DEFAULT_MODEL_ID
  }
  return model
}

export function getSelectedModel(): AiModelId {
  return typeof window === "undefined" ? DEFAULT_MODEL_ID : readModel()
}

export function setSelectedModel(id: AiModelId) {
  if (!isAllowedModel(id)) return
  model = id
  try {
    localStorage.setItem(MODEL_KEY, id)
  } catch {}
  modelListeners.forEach((l) => l())
}

export function useSelectedModel(): AiModelId {
  return useSyncExternalStore(
    (cb) => {
      modelListeners.add(cb)
      return () => modelListeners.delete(cb)
    },
    readModel,
    () => DEFAULT_MODEL_ID
  )
}
