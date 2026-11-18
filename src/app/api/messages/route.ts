import { prisma } from "@/lib/prisma"
import { route } from "@/server/api"
import { miniUserSelect } from "@/server/feed"
import type { ConversationItem } from "@/lib/types"

export const GET = route(async (_req, { user }) => {
  const parts = await prisma.conversationParticipant.findMany({
    where: { userId: user.id },
    orderBy: { conversation: { updatedAt: "desc" } },
    select: {
      lastReadAt: true,
      conversation: {
        select: {
          id: true,
          updatedAt: true,
          participants: { where: { userId: { not: user.id } }, select: { user: { select: miniUserSelect } }, take: 1 },
          messages: { orderBy: { createdAt: "desc" }, take: 1, select: { content: true, createdAt: true, senderId: true } },
        },
      },
    },
  })
  const items: ConversationItem[] = parts
    .filter((p) => p.conversation.participants[0])
    .map(({ lastReadAt, conversation: c }) => {
      const last = c.messages[0]
      return {
        id: c.id,
        other: c.participants[0].user,
        updatedAt: c.updatedAt.toISOString(),
        lastMessage: last ? { content: last.content, createdAt: last.createdAt.toISOString(), fromMe: last.senderId === user.id } : null,
        unread: Boolean(last && last.senderId !== user.id && last.createdAt > lastReadAt),
      }
    })
  return items
})
