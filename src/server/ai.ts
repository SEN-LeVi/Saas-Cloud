import "server-only"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { HttpError } from "@/server/api"
export { describeAiError } from "@/server/ai-errors"
import { DEFAULT_MODEL_ID, isAllowedModel, type AiModelId } from "@/lib/ai-models"

const PLACEHOLDER = "YOUR_API_KEY_HERE"

/** Reads the key on the server only. Never sent to the browser. */
function readApiKey(): string | null {
  const key = process.env.OPENROUTER_API_KEY?.trim()
  if (!key || key === PLACEHOLDER) return null
  return key
}

export function isAiConfigured() {
  return readApiKey() !== null
}

export const NOT_CONFIGURED_MESSAGE =
  "The AI assistant isn't configured yet. Open .env.local, replace YOUR_API_KEY_HERE with your OpenRouter API key, then restart the server."

/**
 * Returns a model for one of the 3 allowed free models. Any other id (including paid
 * models) is rejected, so requests can only ever go to the configured free models.
 */
export function getModel(modelId: string = DEFAULT_MODEL_ID) {
  const apiKey = readApiKey()
  if (!apiKey) throw new HttpError(503, NOT_CONFIGURED_MESSAGE)
  if (!isAllowedModel(modelId)) throw new HttpError(422, "That model isn't available in this workspace.")
  const openrouter = createOpenRouter({
    apiKey,
    headers: { "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000", "X-Title": "Workvine" },
  })
  return openrouter(modelId as AiModelId)
}

export const ASSISTANT_SYSTEM = `You are Workvine AI, a career assistant inside a professional networking app.
Help members write posts, polish their headline and About section, prepare for interviews,
draft polite outreach messages, and understand job descriptions.
Be warm, direct and practical. Prefer short paragraphs and bullet lists. Never invent facts about the member.`
