import { z } from "zod"
import { AI_MODEL_IDS, DEFAULT_MODEL_ID } from "@/lib/ai-models"

export const cursorQuery = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export const createPostSchema = z.object({
  content: z.string().trim().min(1, "Write something to post.").max(3000, "Posts can be up to 3,000 characters."),
})

export const reactionSchema = z.object({
  type: z.enum(["LIKE", "CELEBRATE", "SUPPORT", "LOVE", "INSIGHTFUL", "FUNNY"]).nullable(),
})

export const commentSchema = z.object({
  content: z.string().trim().min(1, "Comment can't be empty.").max(1250),
})

export const connectSchema = z.object({ userId: z.string().min(1) })
export const respondSchema = z.object({ connectionId: z.string().min(1), accept: z.boolean() })

export const jobsQuery = cursorQuery.extend({
  q: z.string().trim().max(100).optional(),
  workplace: z.enum(["ON_SITE", "HYBRID", "REMOTE"]).optional(),
})

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, "Message can't be empty.").max(2000),
})
export const startConversationSchema = z.object({ userId: z.string().min(1) })

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  headline: z.string().trim().max(220).optional(),
  location: z.string().trim().max(100).optional(),
  about: z.string().trim().max(2600).optional(),
  openToWork: z.boolean().optional(),
  skills: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
})

export const searchQuery = z.object({ q: z.string().trim().min(1).max(100) })

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be 8 characters or more."),
})
export const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
})

export const aiRewriteSchema = z.object({
  text: z.string().trim().min(1).max(3000),
  tone: z.enum(["professional", "friendly", "concise"]).default("professional"),
  model: z.enum(AI_MODEL_IDS).default(DEFAULT_MODEL_ID),
})
