import "server-only"
import { and, count, eq, exists, gt, ne, sql } from "drizzle-orm"
import { db, schema } from "@/db/drizzle"

const { conversationParticipants: cp, messages: m } = schema

/** Number of conversations with messages the user hasn't read yet (Drizzle query). */
export async function unreadConversationCount(userId: string) {
  const [row] = await db
    .select({ n: count() })
    .from(cp)
    .where(
      and(
        eq(cp.userId, userId),
        exists(
          db
            .select({ one: sql`1` })
            .from(m)
            .where(and(eq(m.conversationId, cp.conversationId), ne(m.senderId, userId), gt(m.createdAt, cp.lastReadAt)))
        )
      )
    )
  return row?.n ?? 0
}
