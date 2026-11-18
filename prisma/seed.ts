/**
 * Seeds the database with demo members, posts, jobs, connections and messages.
 * Run with: npm run db:seed
 *
 * Demo login → email: demo@workvine.dev  password: Password123!
 */
import "../src/lib/load-env"
import { faker } from "@faker-js/faker"
import { hashPassword } from "better-auth/crypto"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, type ReactionType, type Workplace, type EmploymentType } from "../src/generated/prisma/client"

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
faker.seed(42)

const BANNERS = ["#a0b4b7", "#9db3c8", "#b9a99a", "#a3b5a0", "#b7a3b8", "#c2b48f"]
const COMPANY_COLORS = ["#0a66c2", "#057642", "#b24020", "#8a3ffc", "#e7a33e", "#38434f", "#c37d16", "#0e7490"]
const ROLES = [
  "Senior Frontend Engineer", "Backend Engineer", "Product Designer", "Data Scientist", "Engineering Manager",
  "DevOps Engineer", "Product Manager", "UX Researcher", "Full Stack Developer", "Machine Learning Engineer",
  "Cloud Architect", "Mobile Developer", "QA Automation Engineer", "Technical Writer", "Growth Marketer",
]
const COMPANIES = [
  "Northwind Labs", "Bluepeak Systems", "Cedar & Co", "Lumen Analytics", "Orbit Cloud", "Harbor Health",
  "Quanta Finance", "Pinecrest Studio", "Atlas Robotics", "Meridian Retail", "Sable Security", "Riverstone Media",
]
const SKILLS = [
  "TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Prisma", "Python", "FastAPI", "Docker",
  "Kubernetes", "AWS", "Figma", "System Design", "GraphQL", "Tailwind CSS", "Leadership", "Machine Learning",
]
const POST_TEMPLATES = [
  () => `Excited to share that I've started a new position as ${faker.helpers.arrayElement(ROLES)} at ${faker.helpers.arrayElement(COMPANIES)}! 🎉\n\nGrateful to everyone who supported me along the way. Looking forward to this next chapter.`,
  () => `3 lessons from shipping our biggest release this year:\n\n1. Small pull requests beat heroic merges.\n2. Write the migration plan before the code.\n3. Celebrate the boring wins — monitoring caught two issues before users did.\n\nWhat would you add?`,
  () => `We're hiring! Our team at ${faker.helpers.arrayElement(COMPANIES)} is looking for a ${faker.helpers.arrayElement(ROLES)}. Remote-friendly, kind people, real problems. DM me if you're curious. #hiring #careers`,
  () => `Hot take: the best code review comment is a question, not a command.\n\n"What happens if this list is empty?" teaches more than "Handle the empty case."`,
  () => `Just finished a certification in ${faker.helpers.arrayElement(SKILLS)}. It took 6 weeks of early mornings, but the hands-on labs were worth it. Happy to share my notes with anyone preparing.`,
  () => `${faker.company.catchPhrase()}.\n\nThat's the idea our team kept coming back to this quarter. ${faker.lorem.sentences(2)}`,
  () => `Mentoring tip: when someone asks "how do I get better at ${faker.helpers.arrayElement(SKILLS)}?", ask them what they built last month. Momentum beats curriculum.`,
  () => `Spoke at ${faker.location.city()} Tech Meetup yesterday about ${faker.helpers.arrayElement(SKILLS)} in production. Slides are in the comments. Thank you to everyone who came with great questions!`,
]

async function main() {
  console.log("Clearing existing data…")
  await prisma.$transaction([
    prisma.notification.deleteMany(), prisma.message.deleteMany(), prisma.conversationParticipant.deleteMany(),
    prisma.conversation.deleteMany(), prisma.jobApplication.deleteMany(), prisma.savedJob.deleteMany(), prisma.job.deleteMany(),
    prisma.connection.deleteMany(), prisma.comment.deleteMany(), prisma.reaction.deleteMany(), prisma.post.deleteMany(),
    prisma.education.deleteMany(), prisma.experience.deleteMany(), prisma.session.deleteMany(), prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ])

  console.log("Creating members…")
  const password = await hashPassword("Password123!")
  const demoId = faker.string.uuid()
  const demo = await prisma.user.create({
    data: {
      id: demoId,
      name: "Alex Morgan",
      email: "demo@workvine.dev",
      emailVerified: true,
      handle: "alex-morgan",
      headline: "Full Stack Engineer · Next.js, Node.js & PostgreSQL · Building SaaS products",
      location: "Amman, Jordan",
      about: "I build reliable web products end to end: APIs, databases and the interfaces on top of them. I care about fast pages, clean data models and shipping small improvements every week.",
      industry: "Software Development",
      bannerColor: "#9db3c8",
      openToWork: true,
      skills: ["TypeScript", "Next.js", "Node.js", "PostgreSQL", "Prisma", "Python", "FastAPI"],
      // Better Auth expects credential accounts to use the user id as accountId.
      accounts: { create: { id: faker.string.uuid(), accountId: demoId, providerId: "credential", password } },
      experiences: {
        create: [
          { title: "Full Stack Engineer", company: "Orbit Cloud", location: "Remote", startDate: new Date("2025-01-01"), description: "Building the customer dashboard and billing APIs." },
          { title: "Backend Developer", company: "Pinecrest Studio", location: "Amman · Hybrid", startDate: new Date("2022-06-01"), endDate: new Date("2024-12-01"), description: "APIs, database design and integrations." },
        ],
      },
      educations: { create: [{ school: "University of Jordan", degree: "B.Sc.", field: "Computer Science", startYear: 2018, endYear: 2022 }] },
    },
  })

  const users = [demo]
  for (let i = 0; i < 45; i++) {
    const first = faker.person.firstName()
    const last = faker.person.lastName()
    const role = faker.helpers.arrayElement(ROLES)
    const company = faker.helpers.arrayElement(COMPANIES)
    const u = await prisma.user.create({
      data: {
        id: faker.string.uuid(),
        name: `${first} ${last}`,
        email: faker.internet.email({ firstName: first, lastName: last, provider: "example.com" }).toLowerCase(),
        emailVerified: true,
        handle: `${first}-${last}-${i}`.toLowerCase().replace(/[^a-z0-9-]/g, ""),
        headline: `${role} at ${company}`,
        location: `${faker.location.city()}, ${faker.location.country()}`,
        about: faker.lorem.paragraph(),
        industry: "Technology",
        bannerColor: faker.helpers.arrayElement(BANNERS),
        openToWork: faker.datatype.boolean(0.2),
        skills: faker.helpers.arrayElements(SKILLS, { min: 3, max: 7 }),
        createdAt: faker.date.past({ years: 2 }),
        experiences: {
          create: [
            { title: role, company, startDate: faker.date.past({ years: 3 }), description: faker.lorem.sentence() },
            { title: faker.helpers.arrayElement(ROLES), company: faker.helpers.arrayElement(COMPANIES), startDate: faker.date.past({ years: 7 }), endDate: faker.date.past({ years: 3 }) },
          ],
        },
        educations: { create: [{ school: `${faker.location.city()} University`, degree: "B.Sc.", field: "Computer Science", startYear: 2012, endYear: 2016 }] },
      },
    })
    users.push(u)
  }

  console.log("Creating connections…")
  const others = users.slice(1)
  for (const u of others.slice(0, 18)) {
    await prisma.connection.create({ data: { requesterId: u.id, addresseeId: demo.id, status: "ACCEPTED" } })
  }
  for (const u of others.slice(18, 23)) {
    await prisma.connection.create({ data: { requesterId: u.id, addresseeId: demo.id, status: "PENDING" } })
    await prisma.notification.create({ data: { userId: demo.id, actorId: u.id, type: "CONNECTION_REQUEST", text: "sent you an invitation to connect", href: "/mynetwork", createdAt: faker.date.recent({ days: 5 }) } })
  }
  for (let i = 0; i < 80; i++) {
    const [a, b] = faker.helpers.arrayElements(others, 2)
    await prisma.connection.upsert({
      where: { requesterId_addresseeId: { requesterId: a.id, addresseeId: b.id } },
      create: { requesterId: a.id, addresseeId: b.id, status: "ACCEPTED" },
      update: {},
    })
  }

  console.log("Creating posts…")
  const reactionTypes: ReactionType[] = ["LIKE", "LIKE", "LIKE", "CELEBRATE", "SUPPORT", "LOVE", "INSIGHTFUL", "FUNNY"]
  for (let i = 0; i < 160; i++) {
    const author = i % 17 === 0 ? demo : faker.helpers.arrayElement(others)
    const post = await prisma.post.create({
      data: { authorId: author.id, content: faker.helpers.arrayElement(POST_TEMPLATES)(), createdAt: faker.date.recent({ days: 30 }) },
    })
    const reactors = faker.helpers.arrayElements(users, { min: 0, max: 25 })
    if (reactors.length) {
      await prisma.reaction.createMany({
        data: reactors.map((r) => ({ postId: post.id, userId: r.id, type: faker.helpers.arrayElement(reactionTypes) })),
      })
    }
    const commenters = faker.helpers.arrayElements(others, { min: 0, max: 4 })
    for (const c of commenters) {
      await prisma.comment.create({
        data: {
          postId: post.id,
          authorId: c.id,
          content: faker.helpers.arrayElement(["Congratulations! 👏", "Great insight, thanks for sharing.", "Couldn't agree more.", "This is so helpful!", "Well deserved!", faker.lorem.sentence()]),
          createdAt: faker.date.between({ from: post.createdAt, to: new Date() }),
        },
      })
    }
    if (author.id === demo.id && reactors.length) {
      await prisma.notification.create({
        data: { userId: demo.id, actorId: reactors[0].id === demo.id ? others[0].id : reactors[0].id, type: "REACTION", text: "reacted to your post", href: `/feed#post-${post.id}`, createdAt: faker.date.recent({ days: 7 }) },
      })
    }
  }

  console.log("Creating jobs…")
  const workplaces: Workplace[] = ["ON_SITE", "HYBRID", "REMOTE"]
  const types: EmploymentType[] = ["FULL_TIME", "FULL_TIME", "FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]
  for (let i = 0; i < 120; i++) {
    const role = faker.helpers.arrayElement(ROLES)
    const min = faker.number.int({ min: 40, max: 140 })
    await prisma.job.create({
      data: {
        title: role,
        company: faker.helpers.arrayElement(COMPANIES),
        companyColor: faker.helpers.arrayElement(COMPANY_COLORS),
        location: `${faker.location.city()}, ${faker.location.country()}`,
        workplace: faker.helpers.arrayElement(workplaces),
        type: faker.helpers.arrayElement(types),
        salary: faker.datatype.boolean(0.6) ? `$${min}K/yr - $${min + faker.number.int({ min: 10, max: 60 })}K/yr` : null,
        description: `About the role\n${faker.lorem.paragraph()}\n\nWhat you'll do\n• ${faker.lorem.sentence()}\n• ${faker.lorem.sentence()}\n• ${faker.lorem.sentence()}\n\nWhat we're looking for\n• ${faker.number.int({ min: 1, max: 6 })}+ years with ${faker.helpers.arrayElements(SKILLS, 3).join(", ")}\n• ${faker.lorem.sentence()}`,
        applicants: faker.number.int({ min: 0, max: 400 }),
        createdAt: faker.date.recent({ days: 21 }),
      },
    })
  }

  console.log("Creating conversations…")
  for (const u of others.slice(0, 12)) {
    const convo = await prisma.conversation.create({ data: { participants: { create: [{ userId: demo.id, lastReadAt: new Date(0) }, { userId: u.id }] } } })
    let t = faker.date.recent({ days: 10 })
    const count = faker.number.int({ min: 2, max: 14 })
    for (let k = 0; k < count; k++) {
      t = new Date(t.getTime() + faker.number.int({ min: 2, max: 240 }) * 60_000)
      await prisma.message.create({
        data: {
          conversationId: convo.id,
          senderId: k % 2 === 0 ? u.id : demo.id,
          content: faker.helpers.arrayElement([
            `Hi Alex, thanks for connecting! I saw your work on ${faker.helpers.arrayElement(SKILLS)}.`,
            "Would you be open to a quick call next week?",
            "Sounds great, Tuesday works for me.",
            "Sharing the job description here — let me know what you think.",
            faker.lorem.sentence(),
          ]),
          createdAt: t,
        },
      })
    }
    await prisma.conversation.update({ where: { id: convo.id }, data: { updatedAt: t } })
  }

  console.log(`Done. ${users.length} members. Sign in with demo@workvine.dev / Password123!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
