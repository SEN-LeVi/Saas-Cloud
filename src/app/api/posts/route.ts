import { prisma } from "@/lib/prisma"
import { parseJson, route } from "@/server/api"
import { postInclude, serializePosts } from "@/server/feed"
import { createPostSchema } from "@/lib/validators"

export const POST = route(async (req, { user }) => {
  const { content } = await parseJson(req, createPostSchema)
  const post = await prisma.post.create({
    data: { content, authorId: user.id },
    include: postInclude(user.id),
  })
  const [serialized] = await serializePosts([post])
  return serialized
})
