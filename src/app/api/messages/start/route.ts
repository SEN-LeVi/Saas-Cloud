import { prisma } from "@/lib/prisma"
import { HttpError, parseJson, route } from "@/server/api"
import { startConversationSchema } from "@/lib/validators"

export const POST = route(async (req, { user }) => {
  const { userId } = await parseJson(req, startConversationSchema)
  if (userId === user.id) throw new HttpError(400, "You can't message yourself.")
  const other = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
  if (!other) throw new HttpError(404, "Member not found.")
  const existing = await prisma.conversation.findFirst({
    where: { AND: [{ participants: { some: { userId: user.id } } }, { participants: { some: { userId } } }] },
    select: { id: true },
  })
  if (existing) return { id: existing.id }
  const convo = await prisma.conversation.create({
    data: { participants: { create: [{ userId: user.id }, { userId }] } },
    select: { id: true },
  })
  return { id: convo.id }
})
