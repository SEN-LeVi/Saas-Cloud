import { prisma } from "@/lib/prisma"
import { route } from "@/server/api"

export const POST = route<{ id: string }>(async (_req, { user, params }) => {
  const key = { userId_jobId: { userId: user.id, jobId: params.id } }
  const existing = await prisma.savedJob.findUnique({ where: key })
  if (existing) {
    await prisma.savedJob.delete({ where: key })
    return { saved: false }
  }
  await prisma.savedJob.create({ data: { userId: user.id, jobId: params.id } })
  return { saved: true }
})
