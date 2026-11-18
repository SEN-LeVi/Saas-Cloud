import { prisma } from "@/lib/prisma"
import { HttpError, parseJson, route } from "@/server/api"
import { sendMessageSchema } from "@/lib/validators"
import type { MessageItem } from "@/lib/types"

async function assertMember(conversationId: string, userId: string) {
  const member = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  })
  if (!member) throw new HttpError(404, "Conversation not found.")
}

export const GET = route<{ id: string }>(async (_req, { user, params }) => {
  await assertMember(params.id, user.id)
  const [rows] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: "asc" },
      take: 500,
      select: { id: true, content: true, createdAt: true, senderId: true },
    }),
    prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: params.id, userId: user.id } },
      data: { lastReadAt: new Date() },
    }),
  ])
  const items: MessageItem[] = rows.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))
  return items
})

export const POST = route<{ id: string }>(async (req, { user, params }) => {
  const { content } = await parseJson(req, sendMessageSchema)
  await assertMember(params.id, user.id)
  const now = new Date()
  const [msg] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId: params.id, senderId: user.id, content },
      select: { id: true, content: true, createdAt: true, senderId: true },
    }),
    prisma.conversation.update({ where: { id: params.id }, data: { updatedAt: now } }),
    prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: params.id, userId: user.id } },
      data: { lastReadAt: now },
    }),
  ])
  const item: MessageItem = { ...msg, createdAt: msg.createdAt.toISOString() }
  return item
})
