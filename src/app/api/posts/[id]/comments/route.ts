import { prisma } from "@/lib/prisma"
import { HttpError, parseJson, route } from "@/server/api"
import { miniUserSelect } from "@/server/feed"
import { commentSchema } from "@/lib/validators"
import type { CommentItem } from "@/lib/types"

const toItem = (c: { id: string; content: string; createdAt: Date; author: CommentItem["author"] }): CommentItem => ({
  ...c,
  createdAt: c.createdAt.toISOString(),
})

export const GET = route<{ id: string }>(async (_req, { params }) => {
  const rows = await prisma.comment.findMany({
    where: { postId: params.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, content: true, createdAt: true, author: { select: miniUserSelect } },
  })
  return rows.map(toItem)
})

export const POST = route<{ id: string }>(async (req, { user, params }) => {
  const { content } = await parseJson(req, commentSchema)
  const post = await prisma.post.findUnique({ where: { id: params.id }, select: { authorId: true } })
  if (!post) throw new HttpError(404, "This post no longer exists.")
  const comment = await prisma.comment.create({
    data: { content, postId: params.id, authorId: user.id },
    select: { id: true, content: true, createdAt: true, author: { select: miniUserSelect } },
  })
  if (post.authorId !== user.id) {
    await prisma.notification.create({
      data: { userId: post.authorId, actorId: user.id, type: "COMMENT", text: `commented: "${content.slice(0, 80)}"`, href: `/feed#post-${params.id}` },
    })
  }
  return toItem(comment)
})
