import { prisma } from "@/lib/prisma"
import { HttpError, parseJson, route } from "@/server/api"
import { reactionSchema } from "@/lib/validators"

export const POST = route<{ id: string }>(async (req, { user, params }) => {
  const { type } = await parseJson(req, reactionSchema)
  const post = await prisma.post.findUnique({ where: { id: params.id }, select: { authorId: true } })
  if (!post) throw new HttpError(404, "This post no longer exists.")

  if (type === null) {
    await prisma.reaction.deleteMany({ where: { postId: params.id, userId: user.id } })
    return { ok: true }
  }
  const existing = await prisma.reaction.findUnique({ where: { postId_userId: { postId: params.id, userId: user.id } } })
  await prisma.reaction.upsert({
    where: { postId_userId: { postId: params.id, userId: user.id } },
    create: { postId: params.id, userId: user.id, type },
    update: { type },
  })
  if (!existing && post.authorId !== user.id) {
    await prisma.notification.create({
      data: { userId: post.authorId, actorId: user.id, type: "REACTION", text: "reacted to your post", href: `/feed#post-${params.id}` },
    })
  }
  return { ok: true }
})
