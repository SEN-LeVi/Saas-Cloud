import { prisma } from "@/lib/prisma"
import { HttpError, route } from "@/server/api"
import { unreadConversationCount } from "@/server/stats"
import type { Me } from "@/lib/types"

export const GET = route(async (_req, { user }) => {
  const [me, connections, postReactions, invitations, unreadNotifications, unreadMessages] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, handle: true, headline: true, image: true, email: true, location: true, bannerColor: true, openToWork: true },
    }),
    prisma.connection.count({
      where: { status: "ACCEPTED", OR: [{ requesterId: user.id }, { addresseeId: user.id }] },
    }),
    prisma.reaction.count({ where: { post: { authorId: user.id } } }),
    prisma.connection.count({ where: { addresseeId: user.id, status: "PENDING" } }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
    unreadConversationCount(user.id),
  ])
  if (!me) throw new HttpError(404, "Account not found.")
  const result: Me = { ...me, stats: { connections, postReactions, invitations, unreadNotifications, unreadMessages } }
  return result
})
