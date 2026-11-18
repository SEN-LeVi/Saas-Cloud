import { prisma } from "@/lib/prisma"
import { parseQuery, route } from "@/server/api"
import { postInclude, serializePosts } from "@/server/feed"
import { cursorQuery } from "@/lib/validators"
import type { FeedPost, Page } from "@/lib/types"

export const GET = route(async (req, { user }) => {
  const { cursor, limit } = parseQuery(req, cursorQuery)
  const rows = await prisma.post.findMany({
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: postInclude(user.id),
  })
  const hasMore = rows.length > limit
  const items = await serializePosts(rows.slice(0, limit))
  const page: Page<FeedPost> = { items, nextCursor: hasMore ? items[items.length - 1].id : null }
  return page
})
