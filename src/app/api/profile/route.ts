import { prisma } from "@/lib/prisma"
import { parseJson, route } from "@/server/api"
import { updateProfileSchema } from "@/lib/validators"

export const PATCH = route(async (req, { user }) => {
  const data = await parseJson(req, updateProfileSchema)
  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { handle: true },
  })
  return updated
})
