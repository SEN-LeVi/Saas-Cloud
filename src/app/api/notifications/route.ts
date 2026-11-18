import { prisma } from "@/lib/prisma"
import { route } from "@/server/api"
import { miniUserSelect } from "@/server/feed"
import type { NotificationItem } from "@/lib/types"

export const GET = route(async (_req, { user }) => {
  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, type: true, text: true, href: true, read: true, createdAt: true, actor: { select: miniUserSelect } },
  })
  const items: NotificationItem[] = rows.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))
  return items
})
