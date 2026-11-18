import { prisma } from "@/lib/prisma"
import { route } from "@/server/api"
import { miniUserSelect } from "@/server/feed"
import type { NetworkData } from "@/lib/types"

export const GET = route(async (_req, { user }) => {
  const [invites, mine] = await Promise.all([
    prisma.connection.findMany({
      where: { addresseeId: user.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, requester: { select: miniUserSelect } },
    }),
    prisma.connection.findMany({
      where: { OR: [{ requesterId: user.id }, { addresseeId: user.id }] },
      select: { requesterId: true, addresseeId: true, status: true },
    }),
  ])

  const connectedIds = new Set<string>()
  const pendingOut = new Set<string>()
  const related = new Set<string>([user.id])
  for (const c of mine) {
    const other = c.requesterId === user.id ? c.addresseeId : c.requesterId
    related.add(other)
    if (c.status === "ACCEPTED") connectedIds.add(other)
    else if (c.requesterId === user.id) pendingOut.add(other)
  }

  const candidates = await prisma.user.findMany({
    where: { id: { notIn: [...related].filter((id) => !pendingOut.has(id)) } },
    select: { ...miniUserSelect, bannerColor: true },
    take: 24,
    orderBy: { createdAt: "desc" },
  })

  // Mutual connections: how many of my connections are connected to each candidate.
  const candidateIds = candidates.map((c) => c.id)
  const mutualRows = connectedIds.size
    ? await prisma.connection.findMany({
        where: {
          status: "ACCEPTED",
          OR: [
            { requesterId: { in: candidateIds }, addresseeId: { in: [...connectedIds] } },
            { addresseeId: { in: candidateIds }, requesterId: { in: [...connectedIds] } },
          ],
        },
        select: { requesterId: true, addresseeId: true },
      })
    : []
  const mutuals = new Map<string, number>()
  for (const r of mutualRows) {
    const cand = candidateIds.includes(r.requesterId) ? r.requesterId : r.addresseeId
    mutuals.set(cand, (mutuals.get(cand) ?? 0) + 1)
  }

  const data: NetworkData = {
    connections: connectedIds.size,
    invitations: invites.map((i) => ({ id: i.id, createdAt: i.createdAt.toISOString(), from: i.requester })),
    suggestions: candidates
      .map((c) => ({ ...c, mutuals: mutuals.get(c.id) ?? 0, status: pendingOut.has(c.id) ? ("PENDING_OUT" as const) : ("NONE" as const) }))
      .sort((a, b) => b.mutuals - a.mutuals),
  }
  return data
})
