import { prisma } from "@/lib/prisma"
import { HttpError, parseJson, route } from "@/server/api"
import { respondSchema } from "@/lib/validators"

export const POST = route(async (req, { user }) => {
  const { connectionId, accept } = await parseJson(req, respondSchema)
  const conn = await prisma.connection.findUnique({ where: { id: connectionId } })
  if (!conn || conn.addresseeId !== user.id || conn.status !== "PENDING") {
    throw new HttpError(404, "This invitation is no longer available.")
  }
  if (!accept) {
    await prisma.connection.delete({ where: { id: connectionId } })
    return { ok: true }
  }
  await prisma.connection.update({ where: { id: connectionId }, data: { status: "ACCEPTED" } })
  await prisma.notification.create({
    data: { userId: conn.requesterId, actorId: user.id, type: "CONNECTION_ACCEPTED", text: "accepted your invitation", href: `/in/${user.handle}` },
  })
  return { ok: true }
})
