import { prisma } from "@/lib/prisma"
import { HttpError, route } from "@/server/api"

export const POST = route<{ id: string }>(async (_req, { user, params }) => {
  const job = await prisma.job.findUnique({ where: { id: params.id }, select: { id: true, title: true, company: true } })
  if (!job) throw new HttpError(404, "This job is no longer accepting applications.")
  const existing = await prisma.jobApplication.findUnique({ where: { userId_jobId: { userId: user.id, jobId: job.id } } })
  if (existing) return { applied: true }
  await prisma.$transaction([
    prisma.jobApplication.create({ data: { userId: user.id, jobId: job.id } }),
    prisma.job.update({ where: { id: job.id }, data: { applicants: { increment: 1 } } }),
    prisma.notification.create({
      data: { userId: user.id, type: "JOB", text: `Your application for ${job.title} at ${job.company} was sent`, href: "/jobs" },
    }),
  ])
  return { applied: true }
})
