import { generateText } from "ai"
import { HttpError, parseJson, route } from "@/server/api"
import { describeAiError, getModel } from "@/server/ai"
import { aiRewriteSchema } from "@/lib/validators"

export const maxDuration = 60

export const POST = route(async (req) => {
  const { text, tone, model: modelId } = await parseJson(req, aiRewriteSchema)
  const model = getModel(modelId)
  try {
    const { text: rewritten } = await generateText({
      model,
      maxRetries: 1,
      system:
        "Rewrite the member's draft post for a professional network. Keep their meaning, facts and first-person voice. " +
        "Return only the rewritten post, no preamble, no quotes. Use at most 3 relevant hashtags at the end.",
      prompt: `Tone: ${tone}\n\nDraft:\n${text}`,
    })
    return { text: rewritten.trim(), model: modelId }
  } catch (err) {
    console.error(err)
    const { status, message } = describeAiError(err)
    throw new HttpError(status, message)
  }
})
