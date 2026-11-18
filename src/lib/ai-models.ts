/**
 * The only models the assistant may call. IDs verified against OpenRouter's catalog
 * (GET https://openrouter.ai/api/v1/models) — all three are the ":free" variants (price 0).
 * Safe to import on the client: contains no secrets.
 */
export const AI_MODELS = [
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    name: "Nemotron 3 Ultra",
    label: "NVIDIA Nemotron 3 Ultra (free)",
    description: "Advanced reasoning, coding and complex tasks",
  },
  {
    id: "nvidia/nemotron-3.5-super-vl:free",
    name: "Nemotron 3.5 Super VL",
    label: "NVIDIA Nemotron 3.5 Super VL (free)",
    description: "Image and document understanding",
  },
  {
    id: "nvidia/nemotron-3.5-lightning:free",
    name: "Nemotron 3.5 Lightning",
    label: "NVIDIA Nemotron 3.5 Lightning (free)",
    description: "Fast everyday conversations",
  },
] as const

export type AiModelId = (typeof AI_MODELS)[number]["id"]

export const DEFAULT_MODEL_ID: AiModelId = "nvidia/nemotron-3-ultra-550b-a55b:free"

export const AI_MODEL_IDS = AI_MODELS.map((m) => m.id) as [AiModelId, ...AiModelId[]]

export function isAllowedModel(id: unknown): id is AiModelId {
  return typeof id === "string" && (AI_MODEL_IDS as readonly string[]).includes(id)
}

export function getModelInfo(id: string) {
  return AI_MODELS.find((m) => m.id === id) ?? AI_MODELS[0]
}
