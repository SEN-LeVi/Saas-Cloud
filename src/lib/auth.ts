import "server-only"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { prisma } from "@/lib/prisma"
import { makeHandle } from "@/lib/handle"

export const auth = betterAuth({
  appName: "Workvine",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  rateLimit: {
    // Active in production. Allows a few typos while still blocking password guessing.
    customRules: { "/sign-in/email": { window: 60, max: 10 }, "/sign-up/email": { window: 60, max: 5 } },
  },
  user: {
    additionalFields: {
      handle: { type: "string", required: false, input: false },
      headline: { type: "string", required: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const base = makeHandle(user.name || user.email.split("@")[0])
          let handle = base
          for (let i = 0; await prisma.user.findUnique({ where: { handle } }); i++) {
            handle = `${base}-${Math.random().toString(36).slice(2, 6 + Math.min(i, 4))}`
          }
          const palette = ["#a0b4b7", "#9db3c8", "#b9a99a", "#a3b5a0", "#b7a3b8", "#c2b48f"]
          return {
            data: {
              ...user,
              handle,
              bannerColor: palette[Math.floor(Math.random() * palette.length)],
            },
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
