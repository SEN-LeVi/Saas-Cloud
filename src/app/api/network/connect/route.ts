import { prisma } from "@/lib/prisma"
import { HttpError, parseJson, route } from "@/server/api"
import { connectSchema } from "@/lib/validators"

export const POST = route(async (req, { user }) => {
  const { userId } = await parseJson(req, connectSchema)
  if (userId === user.id) throw new HttpError(400, "You can't connect with yourself.")
  const existing = await prisma.connection.findFirst({
    where: { OR: [{ requesterId: user.id, addresseeId: userId }, { requesterId: userId, addresseeId: user.id }] },
  })
  if (existing) {
    // Withdraw my own pending invite when clicked again.
    if (existing.status === "PENDING" && existing.requesterId === user.id) {
      await prisma.connection.delete({ where: { id: existing.id } })
      return { status: "NONE" }
    }
    return { status: existing.status === "ACCEPTED" ? "CONNECTED" : "PENDING_IN" }
  }
  await prisma.connection.create({ data: { requesterId: user.id, addresseeId: userId } })
  await prisma.notification.create({
    data: { userId, actorId: user.id, type: "CONNECTION_REQUEST", text: "sent you an invitation to connect", href: "/mynetwork" },
  })
  return { status: "PENDING_OUT" }
})
