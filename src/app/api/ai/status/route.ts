import { route } from "@/server/api"
import { isAiConfigured, NOT_CONFIGURED_MESSAGE } from "@/server/ai"

// Tells the UI whether the key is set. Never returns the key itself.
export const GET = route(async () => {
  const configured = isAiConfigured()
  return { configured, message: configured ? null : NOT_CONFIGURED_MESSAGE }
})
