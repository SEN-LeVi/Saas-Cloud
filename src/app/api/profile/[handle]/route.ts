import { prisma } from "@/lib/prisma"
import { HttpError, route } from "@/server/api"
import { postInclude, serializePosts } from "@/server/feed"
import type { Profile } from "@/lib/types"

export const GET = route<{ handle: string }>(async (_req, { user, params }) => {
  const p = await prisma.user.findUnique({
    where: { handle: params.handle },
    select: {
      id: true, name: true, handle: true, headline: true, image: true, location: true, about: true, industry: true,
      bannerColor: true, openToWork: true, skills: true,
      experiences: { orderBy: { startDate: "desc" } },
      educations: { orderBy: { endYear: "desc" } },
      posts: { orderBy: { createdAt: "desc" }, take: 5, include: postInclude(user.id) },
    },
  })
  if (!p) throw new HttpError(404, "This profile doesn't exist.")

  const [connections, link] = await Promise.all([
    prisma.connection.count({ where: { status: "ACCEPTED", OR: [{ requesterId: p.id }, { addresseeId: p.id }] } }),
    prisma.connection.findFirst({
      where: { OR: [{ requesterId: user.id, addresseeId: p.id }, { requesterId: p.id, addresseeId: user.id }] },
    }),
  ])
  const connection: Profile["connection"] = !link
    ? "NONE"
    : link.status === "ACCEPTED"
      ? "CONNECTED"
      : link.requesterId === user.id
        ? "PENDING_OUT"
        : "PENDING_IN"

  const profile: Profile = {
    ...p,
    isMe: p.id === user.id,
    connection,
    connections,
    experiences: p.experiences.map((e) => ({
      id: e.id, title: e.title, company: e.company, location: e.location, description: e.description,
      startDate: e.startDate.toISOString(), endDate: e.endDate?.toISOString() ?? null,
    })),
    educations: p.educations.map((e) => ({ id: e.id, school: e.school, degree: e.degree, field: e.field, startYear: e.startYear, endYear: e.endYear })),
    posts: await serializePosts(p.posts),
  }
  return profile
})
