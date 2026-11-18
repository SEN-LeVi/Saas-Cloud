@AGENTS.md

# SAAS Cloud Ahmad — Workvine

LinkedIn-style professional network. See README.md for setup, scripts and architecture.

## Stack rules
- Next.js 16 App Router with Cache Components: pages are static shells; data is fetched client-side
  through TanStack Query hooks in `src/hooks/queries.ts` (cache persisted to localStorage).
  Anything reading the URL (`usePathname`, `useParams`, `useSearchParams`) must sit inside `<Suspense>`.
- API: route handlers in `src/app/api/**` wrapped with `route()` from `src/server/api.ts`
  (session check + Zod parsing + JSON errors). Validate every input with schemas in `src/lib/validators.ts`.
- Database: Prisma (`prisma/schema.prisma`) owns migrations. Keep `src/db/drizzle/schema.ts` in sync
  (same snake_case table/column names). Use Drizzle for raw/aggregate SQL, Prisma for the rest.
- Auth: Better Auth (`src/lib/auth.ts`, client `src/lib/auth-client.ts`). `src/proxy.ts` does the optimistic redirect.
- AI: OpenRouter via the AI SDK (`src/server/ai.ts`, `/api/ai/chat`, `/api/ai/rewrite`).
- UI: Tailwind v4 tokens in `src/app/globals.css`, shadcn/ui in `src/components/ui`, lucide-react icons.
  Long lists use TanStack Virtual; heavy panels use `next/dynamic`; every route has a skeleton `loading.tsx`.

## Skills to use (installed in `.claude/skills/`)
- **Superpowers**: `brainstorming` before new features → `writing-plans` → `executing-plans` /
  `subagent-driven-development`; plus `test-driven-development`, `systematic-debugging`, `verification-before-completion`.
- **UI / design**: `frontend-design`, `ui-ux-pro-max`, `impeccable` for every screen and component.
- **Browser testing**: `playwright-skill`, and `npm run test:e2e` for the smoke suite.

## One-time setup (Windows)
```
npm install
docker compose up -d        # or use a local PostgreSQL
npm run setup               # prisma migrate + seed
npm run dev
cd .claude\skills\playwright-skill && npm run setup   # Playwright skill dependencies
npx playwright install chromium                        # browsers for npm run test:e2e
```
