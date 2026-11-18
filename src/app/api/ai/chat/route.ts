import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage } from "ai"
import { z } from "zod"
import { HttpError, parseJson, route } from "@/server/api"
import { ASSISTANT_SYSTEM, describeAiError, getModel } from "@/server/ai"
import { AI_MODEL_IDS, DEFAULT_MODEL_ID } from "@/lib/ai-models"

const bodySchema = z.object({
  // Only the 3 configured free models are accepted; anything else is a 422.
  model: z.enum(AI_MODEL_IDS).default(DEFAULT_MODEL_ID),
  messages: z.array(z.looseObject({ id: z.string(), role: z.enum(["system", "user", "assistant"]), parts: z.array(z.any()) })).min(1).max(60),
})

export const maxDuration = 60

export const POST = route(async (req, { user }) => {
  const { model: modelId, messages } = await parseJson(req, bodySchema)
  const model = getModel(modelId) // throws 503 with a setup message if the key is missing/placeholder
  try {
    const result = streamText({
      model,
      maxRetries: 1, // free models are rate-limited; don't hammer them
      system: `${ASSISTANT_SYSTEM}\nThe member's name is ${user.name}.`,
      messages: await convertToModelMessages(messages as UIMessage[]),
    })
    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream, onError: (error) => describeAiError(error).message }),
      headers: { "X-AI-Model": modelId },
    })
  } catch (err) {
    console.error(err)
    const { status, message } = describeAiError(err)
    throw new HttpError(status, message)
  }
})
