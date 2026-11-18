/**
 * Drizzle mirror of prisma/schema.prisma.
 *
 * Prisma owns migrations (`npm run db:migrate`). This file describes the SAME
 * tables so Drizzle can run fast, typed SQL (search, aggregates). Keep table and
 * column names identical to the @map / @@map names in the Prisma schema.
 */
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
const createdAt = () =>
  timestamp("created_at", { precision: 3, mode: "date" }).notNull().defaultNow()
const updatedAt = () =>
  timestamp("updated_at", { precision: 3, mode: "date" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())

export const reactionType = pgEnum("reaction_type", [
  "LIKE",
  "CELEBRATE",
  "SUPPORT",
  "LOVE",
  "INSIGHTFUL",
  "FUNNY",
])
export const connectionStatus = pgEnum("connection_status", ["PENDING", "ACCEPTED"])
export const workplace = pgEnum("workplace", ["ON_SITE", "HYBRID", "REMOTE"])
export const employmentType = pgEnum("employment_type", [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
])
export const notificationType = pgEnum("notification_type", [
  "REACTION",
  "COMMENT",
  "CONNECTION_REQUEST",
  "CONNECTION_ACCEPTED",
  "MESSAGE",
  "JOB",
])

// ─── Auth ───
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  handle: text("handle").notNull().unique(),
  headline: text("headline"),
  location: text("location"),
  about: text("about"),
  industry: text("industry"),
  bannerColor: text("banner_color").notNull().default("#a0b4b7"),
  openToWork: boolean("open_to_work").notNull().default(false),
  skills: text("skills").array().notNull().default([]),
})

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { precision: 3, mode: "date" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)]
)

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { precision: 3, mode: "date" }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { precision: 3, mode: "date" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("accounts_user_id_idx").on(t.userId)]
)

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { precision: 3, mode: "date" }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verifications_identifier_idx").on(t.identifier)]
)

// ─── Profile ───
export const experiences = pgTable(
  "experiences",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    company: text("company").notNull(),
    location: text("location"),
    startDate: timestamp("start_date", { precision: 3, mode: "date" }).notNull(),
    endDate: timestamp("end_date", { precision: 3, mode: "date" }),
    description: text("description"),
  },
  (t) => [index("experiences_user_id_idx").on(t.userId)]
)

export const educations = pgTable(
  "educations",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    school: text("school").notNull(),
    degree: text("degree"),
    field: text("field"),
    startYear: integer("start_year"),
    endYear: integer("end_year"),
  },
  (t) => [index("educations_user_id_idx").on(t.userId)]
)

// ─── Feed ───
export const posts = pgTable(
  "posts",
  {
    id: id(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("posts_created_at_idx").on(t.createdAt.desc()), index("posts_author_id_idx").on(t.authorId)]
)

export const reactions = pgTable(
  "reactions",
  {
    id: id(),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: reactionType("type").notNull().default("LIKE"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("reactions_post_id_user_id_key").on(t.postId, t.userId)]
)

export const comments = pgTable(
  "comments",
  {
    id: id(),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("comments_post_id_created_at_idx").on(t.postId, t.createdAt)]
)

// ─── Network ───
export const connections = pgTable(
  "connections",
  {
    id: id(),
    requesterId: text("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addresseeId: text("addressee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: connectionStatus("status").notNull().default("PENDING"),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("connections_requester_id_addressee_id_key").on(t.requesterId, t.addresseeId),
    index("connections_addressee_id_status_idx").on(t.addresseeId, t.status),
  ]
)

// ─── Jobs ───
export const jobs = pgTable(
  "jobs",
  {
    id: id(),
    title: text("title").notNull(),
    company: text("company").notNull(),
    companyColor: text("company_color").notNull().default("#0a66c2"),
    location: text("location").notNull(),
    workplace: workplace("workplace").notNull().default("ON_SITE"),
    type: employmentType("type").notNull().default("FULL_TIME"),
    salary: text("salary"),
    description: text("description").notNull(),
    applicants: integer("applicants").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("jobs_created_at_idx").on(t.createdAt.desc())]
)

export const savedJobs = pgTable(
  "saved_jobs",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jobId: text("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.jobId] })]
)

export const jobApplications = pgTable(
  "job_applications",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jobId: text("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("job_applications_user_id_job_id_key").on(t.userId, t.jobId)]
)

// ─── Messaging ───
export const conversations = pgTable(
  "conversations",
  {
    id: id(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("conversations_updated_at_idx").on(t.updatedAt.desc())]
)

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at", { precision: 3, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.conversationId, t.userId] }),
    index("conversation_participants_user_id_idx").on(t.userId),
  ]
)

export const messages = pgTable(
  "messages",
  {
    id: id(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("messages_conversation_id_created_at_idx").on(t.conversationId, t.createdAt)]
)

// ─── Notifications ───
export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
    type: notificationType("type").notNull(),
    text: text("text").notNull(),
    href: text("href"),
    read: boolean("read").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("notifications_user_id_created_at_idx").on(t.userId, t.createdAt.desc())]
)
