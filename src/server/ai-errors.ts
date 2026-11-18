import { APICallError, RetryError } from "ai"

/** Turns OpenRouter/AI SDK failures into a message a member can act on. */
export function describeAiError(error: unknown): { status: number; message: string } {
  const err = RetryError.isInstance(error) ? error.lastError : error
  if (APICallError.isInstance(err)) {
    const status = err.statusCode ?? 502
    if (status === 401 || status === 403)
      return { status: 502, message: "OpenRouter rejected the API key. Check OPENROUTER_API_KEY in .env.local and restart the server." }
    if (status === 402)
      return { status: 502, message: "OpenRouter declined the request for this account. Free models need a valid key; check your OpenRouter account." }
    if (status === 404)
      return { status: 503, message: "This model isn't available on OpenRouter right now. Switch to another model and try again." }
    if (status === 429)
      return { status: 429, message: "This free model is busy (rate limit reached). Wait a minute or switch to another model." }
    if (status >= 500)
      return { status: 503, message: "The model provider is having trouble right now. Try again shortly or switch models." }
    return { status: 502, message: "The AI request failed. Try again or switch to another model." }
  }
  return { status: 502, message: "The AI service didn't respond. Try again in a moment." }
}
