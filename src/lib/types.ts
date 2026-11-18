export type ReactionKind = "LIKE" | "CELEBRATE" | "SUPPORT" | "LOVE" | "INSIGHTFUL" | "FUNNY"

export type MiniUser = {
  id: string
  name: string
  handle: string
  headline: string | null
  image: string | null
}

export type Me = MiniUser & {
  email: string
  location: string | null
  bannerColor: string
  openToWork: boolean
  stats: { connections: number; postReactions: number; invitations: number; unreadNotifications: number; unreadMessages: number }
}

export type FeedPost = {
  id: string
  content: string
  createdAt: string
  author: MiniUser
  reactionCount: number
  topReactions: ReactionKind[]
  commentCount: number
  myReaction: ReactionKind | null
}

export type Page<T> = { items: T[]; nextCursor: string | null }

export type CommentItem = { id: string; content: string; createdAt: string; author: MiniUser }

export type Suggestion = MiniUser & { mutuals: number; bannerColor: string; status: "NONE" | "PENDING_OUT" }
export type Invitation = { id: string; createdAt: string; from: MiniUser }
export type NetworkData = { invitations: Invitation[]; suggestions: Suggestion[]; connections: number }

export type JobItem = {
  id: string
  title: string
  company: string
  companyColor: string
  location: string
  workplace: "ON_SITE" | "HYBRID" | "REMOTE"
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP"
  salary: string | null
  description: string
  applicants: number
  createdAt: string
  saved: boolean
  applied: boolean
}

export type ConversationItem = {
  id: string
  other: MiniUser
  lastMessage: { content: string; createdAt: string; fromMe: boolean } | null
  unread: boolean
  updatedAt: string
}
export type MessageItem = { id: string; content: string; createdAt: string; senderId: string }

export type NotificationItem = {
  id: string
  type: "REACTION" | "COMMENT" | "CONNECTION_REQUEST" | "CONNECTION_ACCEPTED" | "MESSAGE" | "JOB"
  text: string
  href: string | null
  read: boolean
  createdAt: string
  actor: MiniUser | null
}

export type Profile = MiniUser & {
  location: string | null
  about: string | null
  industry: string | null
  bannerColor: string
  openToWork: boolean
  skills: string[]
  isMe: boolean
  connection: "NONE" | "PENDING_OUT" | "PENDING_IN" | "CONNECTED"
  connections: number
  experiences: { id: string; title: string; company: string; location: string | null; startDate: string; endDate: string | null; description: string | null }[]
  educations: { id: string; school: string; degree: string | null; field: string | null; startYear: number | null; endYear: number | null }[]
  posts: FeedPost[]
}

export type SearchResults = { people: MiniUser[]; jobs: Pick<JobItem, "id" | "title" | "company" | "companyColor" | "location">[] }
