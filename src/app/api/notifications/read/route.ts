import { prisma } from "@/lib/prisma"
import { route } from "@/server/api"

export const POST = route(async (_req, { user }) => {
  await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } })
  return { ok: true }
})
