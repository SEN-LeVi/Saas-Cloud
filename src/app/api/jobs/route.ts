import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { parseQuery, route } from "@/server/api"
import { jobsQuery } from "@/lib/validators"
import type { JobItem, Page } from "@/lib/types"

export const GET = route(async (req, { user }) => {
  const { cursor, limit, q, workplace } = parseQuery(req, jobsQuery)
  const where: Prisma.JobWhereInput = {
    ...(workplace ? { workplace } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  }
  const rows = await prisma.job.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      saves: { where: { userId: user.id }, select: { userId: true } },
      applications: { where: { userId: user.id }, select: { id: true } },
    },
  })
  const hasMore = rows.length > limit
  const items: JobItem[] = rows.slice(0, limit).map(({ saves, applications, createdAt, ...j }) => ({
    ...j,
    createdAt: createdAt.toISOString(),
    saved: saves.length > 0,
    applied: applications.length > 0,
  }))
  const page: Page<JobItem> = { items, nextCursor: hasMore ? items[items.length - 1].id : null }
  return page
})
