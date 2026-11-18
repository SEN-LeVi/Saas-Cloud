import { desc, ilike, or } from "drizzle-orm"
import { db, schema } from "@/db/drizzle"
import { parseQuery, route } from "@/server/api"
import { searchQuery } from "@/lib/validators"
import type { SearchResults } from "@/lib/types"

// Search runs on Drizzle: plain typed SQL with ILIKE across people and jobs.
export const GET = route(async (req) => {
  const { q } = parseQuery(req, searchQuery)
  const term = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`
  const { users, jobs } = schema
  const [people, jobRows] = await Promise.all([
    db
      .select({ id: users.id, name: users.name, handle: users.handle, headline: users.headline, image: users.image })
      .from(users)
      .where(or(ilike(users.name, term), ilike(users.headline, term), ilike(users.location, term)))
      .limit(10),
    db
      .select({ id: jobs.id, title: jobs.title, company: jobs.company, companyColor: jobs.companyColor, location: jobs.location })
      .from(jobs)
      .where(or(ilike(jobs.title, term), ilike(jobs.company, term)))
      .orderBy(desc(jobs.createdAt))
      .limit(10),
  ])
  const results: SearchResults = { people, jobs: jobRows }
  return results
})
