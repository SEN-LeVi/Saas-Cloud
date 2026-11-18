import "server-only"
import { prisma } from "@/lib/prisma"
import type { FeedPost, ReactionKind } from "@/lib/types"

export const miniUserSelect = {
  id: true,
  name: true,
  handle: true,
  headline: true,
  image: true,
} as const

export const postInclude = (meId: string) =>
  ({
    author: { select: miniUserSelect },
    _count: { select: { reactions: true, comments: true } },
    reactions: { where: { userId: meId }, select: { type: true }, take: 1 },
  }) as const

type PostRow = {
  id: string
  content: string
  createdAt: Date
  author: { id: string; name: string; handle: string; headline: string | null; image: string | null }
  _count: { reactions: number; comments: number }
  reactions: { type: ReactionKind }[]
}

export async function serializePosts(rows: PostRow[]): Promise<FeedPost[]> {
  if (rows.length === 0) return []
  const grouped = await prisma.reaction.groupBy({
    by: ["postId", "type"],
    where: { postId: { in: rows.map((r) => r.id) } },
    _count: { _all: true },
  })
  const top = new Map<string, { type: ReactionKind; n: number }[]>()
  for (const g of grouped) {
    const list = top.get(g.postId) ?? []
    list.push({ type: g.type as ReactionKind, n: g._count._all })
    top.set(g.postId, list)
  }
  return rows.map((r) => ({
    id: r.id,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
    author: r.author,
    reactionCount: r._count.reactions,
    commentCount: r._count.comments,
    myReaction: r.reactions[0]?.type ?? null,
    topReactions: (top.get(r.id) ?? [])
      .sort((a, b) => b.n - a.n)
      .slice(0, 3)
      .map((x) => x.type),
  }))
}
