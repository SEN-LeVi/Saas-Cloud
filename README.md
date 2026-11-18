# Workvine — professional network SaaS

A LinkedIn-style professional network: feed with reactions and comments, My Network (invitations and suggestions), Jobs (search, save, Easy Apply), Messaging, Notifications, Profiles, Search and an AI career assistant.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, Turbopack) |
| UI | Tailwind CSS v4 + shadcn/ui (Radix) + lucide-react icons |
| Backend | Node.js route handlers in TypeScript |
| Validation | Zod (every API input and the auth forms) |
| Database | PostgreSQL |
| ORM | **Prisma 7** owns the schema and migrations. **Drizzle** mirrors the same tables for typed SQL (search, unread counts) |
| Auth | Better Auth (email and password, Prisma adapter) |
| AI | OpenRouter through the Vercel AI SDK (streaming chat and "Rewrite with AI"), limited to 3 free NVIDIA Nemotron models |
| Data layer | TanStack Query (cache persisted to localStorage) and TanStack Virtual |

## Getting started (Windows, macOS or Linux)

You need **Node.js 22+** and **PostgreSQL 14+**.

```bash
# 1. Install dependencies (also generates the Prisma client)
npm install

# 2. Start PostgreSQL, either your local install or Docker:
docker compose up -d

# 3. Create the tables and load demo data
npm run setup        # = prisma migrate dev --name init && npm run db:seed

# 4. Run the app
npm run dev          # http://localhost:3000
```

Demo login: **demo@workvine.dev** / **Password123!** (or click *Try the demo account* on the sign-in page).

### Environment (`.env`)

`.env` is already filled in for a local database. `.env.example` is the template to commit.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/saas_cloud?schema=public` |
| `BETTER_AUTH_SECRET` | Session signing secret (a random one is already generated) |
| `BETTER_AUTH_URL` | Public URL of the app (`http://localhost:3000`) |
| `OPENROUTER_API_KEY` | Put it in **`.env.local`** (git-ignored, overrides `.env`). Key from https://openrouter.ai/keys. The AI assistant shows a setup message until it is set |

### Using PostgreSQL installed on Windows

If you installed PostgreSQL with the Windows installer (pgAdmin comes with it), put your own connection in **`.env.local`**. It overrides `.env` for the app *and* for the Prisma/Drizzle commands:

```
DATABASE_URL="postgresql://postgres:YOUR_DB_PASSWORD@localhost:8030/saas_cloud?schema=public"
```

- Port: the one your server uses (pgAdmin → right-click the server → Properties → Connection). This machine's server is set to **8030**.
- Password: the one you chose for `postgres` during installation.
- The PostgreSQL service must be running (Windows **Services** → `postgresql-x64-18` → Start).

Then run `npm run setup` once. If sign in or sign up fails, the form tells you exactly what's wrong (server not reachable, wrong password, or tables missing). You can also open http://localhost:3000/api/health.

## AI models

The assistant can only call these free OpenRouter models (see `src/lib/ai-models.ts`). Any other model id is rejected by the server.

| Model | OpenRouter id | Best for |
| --- | --- | --- |
| NVIDIA Nemotron 3 Ultra (free) **default** | `nvidia/nemotron-3-ultra-550b-a55b:free` | Reasoning, coding, complex tasks |
| NVIDIA Nemotron 3.5 Super VL (free) | `nvidia/nemotron-3.5-super-vl:free` | Image and document understanding |
| NVIDIA Nemotron 3.5 Lightning (free) | `nvidia/nemotron-3.5-lightning:free` | Fast everyday conversation |

Pick a model from the dropdown at the top of the assistant panel. The choice is remembered (also for "New chat" and after reloads) and every message is sent to the model selected when you send it. Free models are rate-limited by OpenRouter; when that happens the assistant says so and suggests switching models.

## Connect DBeaver

1. **Database → New Database Connection → PostgreSQL → Next**
2. Fill in:
   - Host: `localhost`
   - Port: `5432`
   - Database: `saas_cloud`
   - Username: `postgres`
   - Password: `postgres`
3. **Test Connection** (let DBeaver download the driver if it asks) → **Finish**.
4. Tables are under `saas_cloud → Schemas → public → Tables` (`users`, `posts`, `jobs`, …).

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run setup` | First-time migration + seed |
| `npm run db:migrate` | Create/apply a Prisma migration after editing `prisma/schema.prisma` |
| `npm run db:seed` | Reset demo data |
| `npm run db:studio` | Prisma Studio |
| `npm run drizzle:studio` | Drizzle Studio on the same database |
| `npm run drizzle:pull` | Introspect the DB with Drizzle (to double-check the mirror) |
| `npm run typecheck` / `lint` | TypeScript and ESLint |
| `npm run test:e2e` | Playwright smoke tests (run `npx playwright install chromium` once) |

> When you change `prisma/schema.prisma`, update `src/db/drizzle/schema.ts` to match. Table and column names are snake_case in both.

## Performance features

- **Virtualization**: the feed and notifications use a window virtualizer; jobs, conversations and message threads virtualize inside their scroll panes. Only rows near the viewport are mounted, and heights are measured live.
- **Infinite loading**: feed and jobs fetch the next page as you approach the end.
- **Lazy loading**: the AI chat panel, the post editor, comment threads and avatars/images load only when needed (`next/dynamic`, `loading="lazy"`).
- **Visited pages are cached**: TanStack Query keeps each page's data for 24h and persists it to localStorage, so a revisit (even after a reload) renders instantly from cache and refreshes quietly in the background. The Next.js client router cache (`staleTimes`) keeps visited page shells too.
- **Skeletons on first visit only**: every route has a shimmering skeleton (`loading.tsx` plus per-section skeletons) that shows while data loads the first time.
- Every page ships as a static shell (Cache Components / Partial Prerendering), so navigation is immediate.

## Project layout

```
prisma/              schema.prisma (source of truth) · seed.ts
src/app/             routes: / (landing), (auth)/login|signup, (app)/feed|mynetwork|jobs|messaging|notifications|in/[handle]|search
src/app/api/         route handlers (Zod-validated, session-checked)
src/components/      ui/ (shadcn) · feed · network · jobs · messaging · notifications · profile · ai · shell
src/db/drizzle/      Drizzle schema mirror + client
src/lib/             auth (Better Auth), prisma client, validators (Zod), types
src/server/          API helpers, AI provider, Drizzle queries
src/proxy.ts         redirects signed-out visitors (Next 16 "proxy", formerly middleware)
.claude/skills/      Claude Code skills for this project
```

## Design

The visual language follows the reference site: the system font stack, `#0a66c2` action blue, warm `#f4f2ee` canvas, black-alpha text (90/75/60%), pill-shaped buttons with inset outlines, 8px cards with a hairline ring, 52px top nav with icon + label items, and rust `#b24020` accent headings on the landing page. The brand name (Workvine), logo and illustrations are original.
