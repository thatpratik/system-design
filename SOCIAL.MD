# System Design & Architecture Document

| Field | Value |
|---|---|
| **Project Title** | Core Backend Engine for the Social Network |
| **Target Environment** | macOS (Local Development) |
| **Database Engine** | PostgreSQL (v14+) |
| **ORM** | Prisma Client (TypeScript / Node.js) |
| **Package Manager** | Bun |
| **Document Classification** | Production Blueprint |

---

## 1. Local Database Environment Setup

### 1.1 Command-Line Initialization

PostgreSQL runs as a background service managed via Homebrew or Postgres.app.

```bash
# Start the PostgreSQL daemon
brew services start postgresql

# Connect to the default administrative database
psql postgres
```

### 1.2 Target Database Provisioning

```sql
-- Allocate an isolated database for the application
CREATE DATABASE social;

-- Verify allocation
\l

-- Exit
\q
```

### 1.3 Environment Variables

Prisma reads `.env` by default. Next.js reads `.env.local`. Both files must exist with the same value — they serve different runtimes.

**`.env`** (for Prisma CLI — migrate, generate, studio):
```
DATABASE_URL=postgresql://postgres@localhost:5432/social
```

**`.env.local`** (for Next.js runtime — `process.env.DATABASE_URL` in server code):
```
DATABASE_URL=postgresql://postgres@localhost:5432/social
```

Both files should be listed in `.gitignore` to keep credentials out of source control.

---

## 2. Core Architectural Pillars

The network is divided into six operational engines:

```
       ┌────────────────────────┐
       │      1. USERS          │◀──────────────────────┐
       └────────────────────────┘                       │
          │           │        ▲                        │
          │           │        │                        │
          ▼           ▼        │                        │
   ┌───────────┐ ┌─────────┐ ┌──────────┐  ┌─────────────────┐
   │ 3. POSTS  │ │2. FOLL- │ │5. BLOCKS │  │ 6. NOTIFICA-    │
   │  (FEED)   │ │  OWS    │ │          │  │    TIONS         │
   └───────────┘ └─────────┘ └──────────┘  └─────────────────┘
        │
        ▼
   ┌───────────┐   ┌──────────┐
   │4. LIKES   │   │4. COMMEN-│
   │           │   │   TS     │
   └───────────┘   └──────────┘
```

### A. Users Module — Identity & Node Management

The foundational anchor. Manages credentials, profile state, account roles, and verification status.

- **Absolute unique indexing** on `username` and `email` for sub-millisecond auth lookups.
- **Security**: passwords are never stored in plaintext. Application-level hashing (Argon2id recommended) is mandatory before any write hits the database.
- **Role enum** (`USER / ADMIN / MODERATOR`) enables platform-level moderation without a separate permissions table.
- **`isActive` flag** allows soft-disabling accounts without cascading deletes.

### B. Connections Module — The Social Graph

Manages unidirectional (Twitter/Instagram-style) follow relationships.

- Self-referencing explicit join table with a composite primary key prevents duplicate edges.
- `onDelete: Cascade` on both FK sides ensures graph edges are cleaned up when a node is removed.

### C. Feed & Content Module — The Timeline Engine

Handles media assets and text payloads authored by users.

- **Fan-Out-on-Read**: timelines are assembled dynamically at read time by querying the graph rather than pre-writing to individual feed tables.
- **Media support**: `mediaUrls` stores an ordered array of CDN URLs (images, videos) alongside the text content.
- **Soft deletion**: `deletedAt` marks content as hidden without permanently purging rows, enabling restoration.
- **Partial index** on non-deleted rows keeps feed queries efficient as the table grows.

### D. Likes Module — Engagement Signals

Tracks which users have liked which posts.

- Composite primary key `(userId, postId)` enforces one-like-per-user at the database level — no application-side deduplication needed.
- Cascade delete ensures like records vanish when either the user or the post is removed.

### E. Comments Module — Discussion Layer

Stores threaded text replies on posts.

- Supports soft deletion (same `deletedAt` pattern as posts) for consistent content moderation.
- Compound index on `(postId, createdAt ASC)` enables efficient chronological pagination of comments per post.

### F. Blocks Module — Safety Boundary

Prevents blocked users from appearing in feeds, search results, or interaction surfaces.

- Same structural pattern as `Follow` — a self-referencing explicit join table.
- Must be checked at the query layer before returning any user-facing content.

### G. Notifications Module — Reactive Event Ledger

Tracks user activities (likes, comments, follows) and surfaces them to the target user.

- **Typed events** via `NotificationType` enum.
- **Explicit FK pointers** (`postId`, `commentId`) with `onDelete: SetNull` replace the original polymorphic `entityId` string. This preserves notification history even if the referenced content is deleted, while eliminating dangling pointer bugs.
- **Composite index** on `(receiverId, isRead)` ensures unread-count badge queries touch only the minimum rows.

---

## 3. Database Schema (schema.prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ── Enums ─────────────────────────────────────────────────────────────────────

enum Role {
  USER
  ADMIN
  MODERATOR
}

enum NotificationType {
  LIKE
  COMMENT
  FOLLOW
}

// ── Models ────────────────────────────────────────────────────────────────────

/// Core identity model representing individual network accounts
model User {
  id           String   @id @default(uuid())
  username     String   @unique
  email        String   @unique
  passwordHash String   @map("password_hash")
  bio          String?  @db.Text
  avatarUrl    String?  @map("avatar_url")
  isVerified   Boolean  @default(false) @map("is_verified")
  isActive     Boolean  @default(true)  @map("is_active")
  role         Role     @default(USER)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt      @map("updated_at")

  posts                 Post[]
  comments              Comment[]
  likes                 Like[]
  followers             Follow[]       @relation("FollowingRelation")
  following             Follow[]       @relation("FollowerRelation")
  blocking              Block[]        @relation("BlockerRelation")
  blockedBy             Block[]        @relation("BlockedRelation")
  notificationsReceived Notification[] @relation("NotificationReceiver")
  notificationsSent     Notification[] @relation("NotificationSender")

  @@index([username])
  @@map("users")
}

/// Explicit join model forming the self-referencing Social Graph
model Follow {
  followerId  String   @map("follower_id")
  followingId String   @map("following_id")
  createdAt   DateTime @default(now()) @map("created_at")

  follower  User @relation("FollowerRelation",  fields: [followerId],  references: [id], onDelete: Cascade)
  following User @relation("FollowingRelation", fields: [followingId], references: [id], onDelete: Cascade)

  @@id([followerId, followingId])
  @@index([followingId])   // Optimises reverse lookup: "Who follows user X?"
  @@map("follows")
}

/// Safety boundary — blocks user nodes from appearing in feeds and interactions
model Block {
  blockerId String   @map("blocker_id")
  blockedId String   @map("blocked_id")
  createdAt DateTime @default(now()) @map("created_at")

  blocker User @relation("BlockerRelation", fields: [blockerId], references: [id], onDelete: Cascade)
  blocked User @relation("BlockedRelation", fields: [blockedId], references: [id], onDelete: Cascade)

  @@id([blockerId, blockedId])
  @@map("blocks")
}

/// Core content model — text + ordered media URLs with soft deletion
model Post {
  id        String    @id @default(uuid())
  content   String    @db.Text
  mediaUrls String[]  @map("media_urls")   // Ordered list of CDN URLs (images, video)
  authorId  String    @map("author_id")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt      @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  author        User           @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments      Comment[]
  likes         Like[]
  notifications Notification[]

  @@index([authorId, createdAt(sort: Desc)])  // Feed generation
  @@index([deletedAt])                         // Partial-scan support for soft-delete filter
  @@map("posts")
}

/// Discussion layer — threaded replies on posts with soft deletion
model Comment {
  id        String    @id @default(uuid())
  content   String    @db.Text
  authorId  String    @map("author_id")
  postId    String    @map("post_id")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt      @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  author        User           @relation(fields: [authorId], references: [id], onDelete: Cascade)
  post          Post           @relation(fields: [postId],   references: [id], onDelete: Cascade)
  notifications Notification[]

  @@index([postId, createdAt(sort: Asc)])  // Chronological comment pagination
  @@map("comments")
}

/// Engagement signal — one like per user per post, enforced at the DB level
model Like {
  userId    String   @map("user_id")
  postId    String   @map("post_id")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@id([userId, postId])   // Composite PK prevents duplicate likes
  @@map("likes")
}

/// Notification ledger tracking cross-node reactive events
model Notification {
  id         String           @id @default(uuid())
  type       NotificationType
  isRead     Boolean          @default(false) @map("is_read")
  receiverId String           @map("receiver_id")
  notifierId String           @map("notifier_id")
  postId     String?          @map("post_id")     // Set for LIKE / COMMENT events
  commentId  String?          @map("comment_id")  // Set for COMMENT events
  createdAt  DateTime         @default(now()) @map("created_at")

  receiver User     @relation("NotificationReceiver", fields: [receiverId], references: [id], onDelete: Cascade)
  notifier User     @relation("NotificationSender",   fields: [notifierId], references: [id], onDelete: Cascade)
  post     Post?    @relation(fields: [postId],    references: [id], onDelete: SetNull)
  comment  Comment? @relation(fields: [commentId], references: [id], onDelete: SetNull)

  @@index([receiverId, isRead])  // Unread badge count — minimal scan
  @@index([receiverId, createdAt(sort: Desc)])  // Notification feed pagination
  @@map("notifications")
}
```

---

## 4. Query Execution Patterns

### 4.1 Dynamic Fan-Out-on-Read Timeline

Assembles a user's feed in a **single database round-trip** using a nested Prisma query instead of two sequential calls.

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Returns up to 20 non-deleted posts from accounts the user follows,
 * including the user's own posts, sorted newest-first.
 */
export async function getChronologicalTimelineFeed(userId: string) {
  return prisma.post.findMany({
    where: {
      deletedAt: null,
      author: {
        // Filter to posts authored by people this user follows (or themselves)
        OR: [
          { followers: { some: { followerId: userId } } },
          { id: userId },
        ],
        // Exclude posts from users who have blocked the requesting user
        blockedBy: { none: { blockerId: userId } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      author: {
        select: { id: true, username: true, avatarUrl: true, isVerified: true },
      },
      _count: {
        select: { likes: true, comments: true },
      },
    },
  });
}
```

**What changed from the original:**
- Single query instead of two sequential round-trips (no separate `follow.findMany`)
- Block exclusion baked into the query
- `_count` aggregation returns like and comment counts without N+1 queries

### 4.2 Cursor-Based Pagination

For feeds beyond the first 20 posts, use cursor pagination — not offset (`skip: N`). Offset degrades as the table grows; cursors are O(1).

```typescript
export async function getTimelinePage(userId: string, cursor?: string) {
  return prisma.post.findMany({
    where: { deletedAt: null, author: { followers: { some: { followerId: userId } } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,   // Skip the cursor row itself
    }),
    include: {
      author: { select: { id: true, username: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
}
```

### 4.3 Unread Notification Count

```typescript
export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { receiverId: userId, isRead: false },
    // Hits the @@index([receiverId, isRead]) directly — minimal scan
  });
}
```

---

## 5. Risk Assessment & Engineering Mitigations

| Risk Vector | Impact | Mitigation |
|---|---|---|
| **Celebrity Node Problem** | Feed query degrades for users following mega-accounts | Use cursor pagination; cache timelines for high-follower accounts in Redis |
| **Orphan Data** | Deleting a user leaves broken references | `onDelete: Cascade` on all FK relations; `onDelete: SetNull` on notification pointers |
| **Notification Count Bottleneck** | Slow badge queries under high volume | `@@index([receiverId, isRead])` narrows scan to unread rows only |
| **Accidental Content Deletion** | Loss of posts and interaction metrics | `deletedAt` soft-delete on Post and Comment; hard delete requires explicit admin action |
| **Duplicate Likes** | Race condition lets a user like the same post twice | Composite PK `(userId, postId)` on Like — DB rejects duplicates at the constraint level |
| **N+1 on Counts** | Fetching like/comment counts per post in a loop | Use `_count` aggregate inside the same `findMany` — single query for all posts |
| **Dangling Notification Pointers** | Post deleted, notification still points to it | `onDelete: SetNull` on `Notification.postId` and `Notification.commentId` — pointer becomes null, notification row preserved |
| **Plain-text Passwords** | Catastrophic on breach | Enforce Argon2id hashing in the service layer before any Prisma write; never pass raw passwords to the DB |
| **Blocked User Visibility** | Blocked user appears in requester's feed | `blockedBy: { none: { blockerId: userId } }` filter baked into every feed query |

---

## 6. Implementation Checklist

- [ ] `brew services start postgresql` — verify local Postgres is running
- [ ] `psql postgres -c "CREATE DATABASE social;"` — provision the database
- [ ] Create `.env` with `DATABASE_URL=postgresql://postgres@localhost:5432/social` (for Prisma CLI)
- [ ] Confirm `.env.local` has the same `DATABASE_URL` (for Next.js runtime)
- [ ] `bun add prisma @prisma/client` — install Prisma
- [ ] `bunx prisma init` — scaffold the `prisma/` directory
- [ ] Replace generated `schema.prisma` with the schema in Section 3
- [ ] `bunx prisma migrate dev --name init_social_schema` — apply schema to local DB
- [ ] `bunx prisma generate` — generate type-safe Prisma Client
- [ ] `bunx prisma studio` — visually verify all tables, columns, and relations
- [ ] Add `lib/prisma.ts` singleton client to avoid connection pool exhaustion in Next.js dev mode
