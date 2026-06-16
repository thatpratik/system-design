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

```bash
# Start the PostgreSQL daemon
brew services start postgresql

# Connect to the default administrative database
psql postgres
```

### 1.2 Target Database Provisioning

```sql
CREATE DATABASE social;
\l
\q
```

### 1.3 Environment Variables

Prisma reads `.env` by default. Next.js reads `.env.local`. Both files must exist with the same value — they serve different runtimes.

**`.env`** (Prisma CLI — migrate, generate, studio):
```
DATABASE_URL=postgresql://postgres@localhost:5432/social
```

**`.env.local`** (Next.js runtime — `process.env.DATABASE_URL` in server code):
```
DATABASE_URL=postgresql://postgres@localhost:5432/social
```

Both files must be listed in `.gitignore`.

---

## 2. Core Architectural Pillars

```
       ┌────────────────────────┐
       │      1. USERS          │◀──────────────────────────┐
       └────────────────────────┘                           │
          │        │        ▲                               │
          ▼        ▼        │                               │
   ┌──────────┐ ┌────────┐ ┌─────────┐  ┌──────────────────┐
   │ 3. POSTS │ │2. FOL- │ │6. BLOCK │  │  7. NOTIFICA-    │
   │  (FEED)  │ │  LOWS  │ │         │  │     TIONS        │
   └──────────┘ └────────┘ └─────────┘  └──────────────────┘
        │
        ▼
   ┌──────────┐   ┌──────────┐   ┌──────────────┐
   │ 4. LIKES │   │5. COMMEN-│   │ 4b. COMMENT  │
   │          │   │   TS     │   │    LIKES     │
   └──────────┘   └──────────┘   └──────────────┘
```

### A. Users — Identity & Node Management
Foundational anchor. Manages credentials, profile state, roles, and verification. Unique indexes on `username` and `email` for sub-millisecond auth lookups. Role enum (`USER / ADMIN / MODERATOR`) enables moderation. `isActive` allows soft-disabling without cascading deletes.

### B. Follows — The Social Graph
Unidirectional (Twitter/Instagram-style) follow relationships. Self-referencing join table. Composite PK prevents duplicate edges. DB-level check blocks self-follows. Trigger automatically removes the corresponding FOLLOW notification on unfollow.

### C. Posts — The Timeline Engine
Text + ordered CDN media URLs. Content is optional to allow media-only posts. Fan-out-on-read timeline assembled in a single nested Prisma query. Soft deletion via `deletedAt`; a trigger cascades soft-deletes to child comments automatically.

### D. Likes — Post Engagement
Composite PK `(userId, postId)` enforces one like per user per post at the database level. A trigger automatically removes the LIKE notification when a user unlikes.

### E. Comments — Discussion Layer
Threaded replies via `parentId` self-reference (one level enforced at application layer). Soft deletion mirrors the Post pattern. Separate `CommentLike` model for comment-level engagement.

### F. CommentLikes — Comment Engagement
Mirrors the `Like` model but targets comments instead of posts.

### G. Blocks — Safety Boundary
Self-referencing join table. DB check blocks self-blocking. `@@index([blockedId])` enables efficient "has requester been blocked by this author?" checks on every feed query.

### H. Notifications — Reactive Event Ledger
Typed events (LIKE, COMMENT, FOLLOW). Explicit FK pointers (`postId`, `commentId`) with `onDelete: SetNull` replace the original polymorphic string — notification history is preserved but pointers null out if content is deleted. Partial unique indexes prevent duplicate like/follow notifications. Self-notification check constraint blocks notifying yourself.

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
  COMMENT_LIKE
  COMMENT
  FOLLOW
}

// ── Models ────────────────────────────────────────────────────────────────────

/// Core identity model
model User {
  id           String   @id @default(uuid())
  username     String   @unique @db.VarChar(30)
  email        String   @unique @db.VarChar(255)
  passwordHash String   @map("password_hash")
  bio          String?  @db.VarChar(160)
  avatarUrl    String?  @map("avatar_url")
  isVerified   Boolean  @default(false) @map("is_verified")
  isActive     Boolean  @default(true)  @map("is_active")
  role         Role     @default(USER)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt      @map("updated_at")

  posts                 Post[]
  comments              Comment[]
  likes                 Like[]
  commentLikes          CommentLike[]
  followers             Follow[]       @relation("FollowerRelation")
  following             Follow[]       @relation("FollowingRelation")
  blocking              Block[]        @relation("BlockerRelation")
  blockedBy             Block[]        @relation("BlockedRelation")
  notificationsReceived Notification[] @relation("NotificationReceiver")
  notificationsSent     Notification[] @relation("NotificationSender")

  @@index([username])
  @@map("users")
}

/// Unidirectional social graph edge
model Follow {
  followerId  String   @map("follower_id")
  followingId String   @map("following_id")
  createdAt   DateTime @default(now()) @map("created_at")

  // "FollowerRelation" = the follower (person who initiated the follow)
  follower  User @relation("FollowerRelation",  fields: [followerId],  references: [id], onDelete: Cascade)
  // "FollowingRelation" = the person being followed
  following User @relation("FollowingRelation", fields: [followingId], references: [id], onDelete: Cascade)

  @@id([followerId, followingId])
  @@index([followingId])  // "Who follows user X?" reverse lookup
  @@map("follows")
  // Raw SQL constraint (see Section 4): CHECK (follower_id <> following_id)
}

/// Safety boundary — blocks user nodes from all interaction surfaces
model Block {
  blockerId String   @map("blocker_id")
  blockedId String   @map("blocked_id")
  createdAt DateTime @default(now()) @map("created_at")

  blocker User @relation("BlockerRelation", fields: [blockerId], references: [id], onDelete: Cascade)
  blocked User @relation("BlockedRelation", fields: [blockedId], references: [id], onDelete: Cascade)

  @@id([blockerId, blockedId])
  @@index([blockedId])  // Feed filter: "has requester been blocked by this author?"
  @@map("blocks")
  // Raw SQL constraint (see Section 4): CHECK (blocker_id <> blocked_id)
}

/// Content post — text and/or ordered CDN media URLs, with soft deletion
model Post {
  id        String    @id @default(uuid())
  content   String?   @db.VarChar(2200)   // Optional — media-only posts allowed
  mediaUrls String[]  @map("media_urls")  // Ordered CDN URLs (images, video)
  authorId  String    @map("author_id")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt      @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  author        User           @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments      Comment[]
  likes         Like[]
  notifications Notification[]

  @@index([authorId, createdAt(sort: Desc)])
  // @@index([deletedAt]) REMOVED — full index on a nullable column with mostly-NULL values
  // is nearly useless and adds write overhead. Use the raw SQL partial index in Section 4.
  @@map("posts")
  // Raw SQL constraints (see Section 4):
  //   CHECK (content IS NOT NULL OR array_length(media_urls, 1) > 0)  -- must have something
}

/// Threaded comment with soft deletion. parentId enables one-level reply threads.
model Comment {
  id        String    @id @default(uuid())
  content   String    @db.VarChar(1000)
  authorId  String    @map("author_id")
  postId    String    @map("post_id")
  parentId  String?   @map("parent_id")  // Self-reference for reply threading
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt      @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  author        User          @relation(fields: [authorId], references: [id], onDelete: Cascade)
  post          Post          @relation(fields: [postId],   references: [id], onDelete: Cascade)
  parent        Comment?      @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies       Comment[]     @relation("CommentReplies")
  commentLikes  CommentLike[]
  notifications Notification[]

  @@index([postId, createdAt(sort: Asc)])              // Chronological comments per post
  @@index([authorId, createdAt(sort: Desc)])            // Profile page: all comments by a user
  @@index([parentId])                                   // Fetch replies to a comment
  @@map("comments")
}

/// Post like — composite PK enforces one like per user per post at DB level
model Like {
  userId    String   @map("user_id")
  postId    String   @map("post_id")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@id([userId, postId])
  @@map("likes")
  // Trigger (see Section 4): on DELETE → remove matching LIKE notification
}

/// Comment like — mirrors Like but targets comments
model CommentLike {
  userId    String   @map("user_id")
  commentId String   @map("comment_id")
  createdAt DateTime @default(now()) @map("created_at")

  user    User    @relation(fields: [userId],    references: [id], onDelete: Cascade)
  comment Comment @relation(fields: [commentId], references: [id], onDelete: Cascade)

  @@id([userId, commentId])
  @@map("comment_likes")
  // Trigger (see Section 4): on DELETE → remove matching COMMENT_LIKE notification
}

/// Notification ledger — typed events with explicit FK pointers
model Notification {
  id         String           @id @default(uuid())
  type       NotificationType
  isRead     Boolean          @default(false) @map("is_read")
  receiverId String           @map("receiver_id")
  notifierId String           @map("notifier_id")
  postId     String?          @map("post_id")      // Set for LIKE / COMMENT events
  commentId  String?          @map("comment_id")   // Set for COMMENT / COMMENT_LIKE events
  createdAt  DateTime         @default(now()) @map("created_at")

  receiver User     @relation("NotificationReceiver", fields: [receiverId], references: [id], onDelete: Cascade)
  notifier User     @relation("NotificationSender",   fields: [notifierId], references: [id], onDelete: Cascade)
  post     Post?    @relation(fields: [postId],    references: [id], onDelete: SetNull)
  comment  Comment? @relation(fields: [commentId], references: [id], onDelete: SetNull)

  @@index([receiverId, isRead])                    // Unread badge count
  @@index([receiverId, createdAt(sort: Desc)])     // Notification feed pagination
  @@map("notifications")
  // Raw SQL partial unique indexes (see Section 4) prevent duplicate like/follow notifications
  // Raw SQL constraint: CHECK (notifier_id <> receiver_id) — no self-notifications
}
```

---

## 4. Raw SQL Migrations

Prisma's schema DSL cannot express partial indexes, check constraints, or triggers. These must be applied in a custom migration file (`prisma/migrations/<timestamp>_constraints_and_triggers/migration.sql`).

### 4.1 Check Constraints

```sql
-- Follow: prevent self-follow
ALTER TABLE follows
  ADD CONSTRAINT no_self_follow
  CHECK (follower_id <> following_id);

-- Block: prevent self-block
ALTER TABLE blocks
  ADD CONSTRAINT no_self_block
  CHECK (blocker_id <> blocked_id);

-- Post: must have text content OR at least one media URL
ALTER TABLE posts
  ADD CONSTRAINT post_has_content
  CHECK (content IS NOT NULL OR array_length(media_urls, 1) > 0);

-- Comment: content cannot be blank
ALTER TABLE comments
  ADD CONSTRAINT comment_not_empty
  CHECK (length(trim(content)) > 0);

-- Username: lowercase alphanumeric and underscore, 3–30 chars
ALTER TABLE users
  ADD CONSTRAINT valid_username
  CHECK (username ~ '^[a-z0-9_]{3,30}$');

-- Notification: actor cannot notify themselves (liking own post, etc.)
ALTER TABLE notifications
  ADD CONSTRAINT no_self_notification
  CHECK (notifier_id <> receiver_id);
```

### 4.2 Partial Indexes

```sql
-- Active post feed index — only indexes non-deleted rows.
-- Replaces the useless @@index([deletedAt]) that was in the schema.
-- A full index on a mostly-NULL column adds write overhead with no read benefit.
CREATE INDEX posts_active_feed_idx
  ON posts (author_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Duplicate LIKE notification prevention.
-- NULL-safe: standard UNIQUE doesn't treat NULLs as equal in Postgres,
-- so @@unique in Prisma would not block duplicate FOLLOW notifications (postId = NULL).
CREATE UNIQUE INDEX notif_like_unique
  ON notifications (notifier_id, receiver_id, post_id)
  WHERE type = 'LIKE';

-- Duplicate FOLLOW notification prevention
CREATE UNIQUE INDEX notif_follow_unique
  ON notifications (notifier_id, receiver_id)
  WHERE type = 'FOLLOW';

-- Duplicate COMMENT_LIKE notification prevention
CREATE UNIQUE INDEX notif_comment_like_unique
  ON notifications (notifier_id, receiver_id, comment_id)
  WHERE type = 'COMMENT_LIKE';
```

### 4.3 Triggers

#### Soft-delete cascade: Post → Comments

When a post is soft-deleted, all its child comments must also be soft-deleted atomically. Prisma's `onDelete: Cascade` only fires on hard deletes; this trigger covers the soft-delete path.

```sql
CREATE OR REPLACE FUNCTION cascade_post_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    UPDATE comments
    SET deleted_at = NEW.deleted_at
    WHERE post_id = NEW.id AND deleted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_soft_delete_cascade
AFTER UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION cascade_post_soft_delete();
```

#### Notification cleanup: Unlike → delete LIKE notification

When a `Like` row is deleted, remove the corresponding LIKE notification. No FK exists between `likes` and `notifications`, so this cannot be expressed as `onDelete: Cascade` — it requires a trigger.

```sql
CREATE OR REPLACE FUNCTION cleanup_like_notification()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM notifications
  WHERE notifier_id = OLD.user_id
    AND type        = 'LIKE'
    AND post_id     = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER like_delete_cleanup
AFTER DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION cleanup_like_notification();
```

#### Notification cleanup: Unfollow → delete FOLLOW notification

```sql
CREATE OR REPLACE FUNCTION cleanup_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM notifications
  WHERE notifier_id = OLD.follower_id
    AND receiver_id = OLD.following_id
    AND type        = 'FOLLOW';
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER follow_delete_cleanup
AFTER DELETE ON follows
FOR EACH ROW
EXECUTE FUNCTION cleanup_follow_notification();
```

#### Notification cleanup: Un-like comment → delete COMMENT_LIKE notification

```sql
CREATE OR REPLACE FUNCTION cleanup_comment_like_notification()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM notifications
  WHERE notifier_id = OLD.user_id
    AND type        = 'COMMENT_LIKE'
    AND comment_id  = OLD.comment_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_like_delete_cleanup
AFTER DELETE ON comment_likes
FOR EACH ROW
EXECUTE FUNCTION cleanup_comment_like_notification();
```

#### DB-level `updated_at` enforcement

Prisma's `@updatedAt` runs at the ORM layer — direct SQL scripts (migrations, admin tools) bypass it. This trigger ensures `updated_at` is always accurate regardless of how the row is modified.

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER posts_updated_at    BEFORE UPDATE ON posts    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## 5. Transaction Patterns

Every operation that touches more than one table must be wrapped in a transaction. An operation that succeeds on one table and fails on another leaves the database in a corrupt state — a like with no notification, or a follow with no graph edge.

### 5.1 Like a Post

```typescript
async function likePost(actorId: string, postId: string) {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    select: { authorId: true },
  });

  await prisma.$transaction([
    // 1. Create like — composite PK rejects duplicate at DB level
    prisma.like.create({ data: { userId: actorId, postId } }),

    // 2. Create notification — partial unique index prevents duplicate LIKE alerts
    // Skip if actor is liking their own post (DB constraint also catches this)
    ...(actorId !== post.authorId
      ? [prisma.notification.create({
          data: {
            type:       'LIKE',
            notifierId: actorId,
            receiverId: post.authorId,
            postId,
          },
        })]
      : []),
  ]);
}
```

### 5.2 Unlike a Post

```typescript
async function unlikePost(actorId: string, postId: string) {
  // Trigger on `likes` DELETE automatically removes the LIKE notification.
  // Only the like deletion needs to be explicit here.
  await prisma.like.delete({
    where: { userId_postId: { userId: actorId, postId } },
  });
}
```

### 5.3 Follow a User

```typescript
async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) throw new Error('Cannot follow yourself');

  await prisma.$transaction([
    prisma.follow.create({ data: { followerId, followingId } }),

    prisma.notification.create({
      data: {
        type:       'FOLLOW',
        notifierId: followerId,
        receiverId: followingId,
      },
    }),
  ]);
}
```

### 5.4 Unfollow a User

```typescript
async function unfollowUser(followerId: string, followingId: string) {
  // Trigger on `follows` DELETE automatically removes the FOLLOW notification.
  await prisma.follow.delete({
    where: { followerId_followingId: { followerId, followingId } },
  });
}
```

### 5.5 Create a Post

```typescript
async function createPost(authorId: string, data: { content?: string; mediaUrls?: string[] }) {
  // DB CHECK constraint enforces that at least one of content / mediaUrls is present.
  return prisma.post.create({
    data: { authorId, content: data.content, mediaUrls: data.mediaUrls ?? [] },
  });
}
```

### 5.6 Soft-Delete a Post

```typescript
async function softDeletePost(postId: string) {
  const now = new Date();
  // Trigger cascades deleted_at to all child comments automatically.
  await prisma.post.update({
    where: { id: postId },
    data:  { deletedAt: now },
  });
}
```

### 5.7 Add a Comment

```typescript
async function addComment(
  authorId: string,
  postId: string,
  content: string,
  parentId?: string,
) {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    select: { authorId: true },
  });

  return prisma.$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: { authorId, postId, content, parentId },
    });

    // Notify post author — skip if commenter IS the author
    if (authorId !== post.authorId) {
      await tx.notification.create({
        data: {
          type:       'COMMENT',
          notifierId: authorId,
          receiverId: post.authorId,
          postId,
          commentId:  comment.id,
        },
      });
    }

    return comment;
  });
}
```

---

## 6. Query Execution Patterns

### 6.1 Timeline Feed — Single Round-Trip

```typescript
export async function getChronologicalTimelineFeed(userId: string, cursor?: string) {
  return prisma.post.findMany({
    where: {
      deletedAt: null,
      author: {
        OR: [
          { followers: { some: { followerId: userId } } },
          { id: userId },
        ],
        blockedBy: { none: { blockerId: userId } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    include: {
      author: { select: { id: true, username: true, avatarUrl: true, isVerified: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
}
```

### 6.2 Unread Notification Count

```typescript
export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { receiverId: userId, isRead: false },
  });
}
```

---

## 7. Risk Assessment

| Risk | Impact | Mitigation |
|---|---|---|
| **Celebrity Node Problem** | Feed query degrades for users following mega-accounts | Cursor pagination; Redis cache for high-follower timelines |
| **Orphan Data** | Broken references after user deletion | `onDelete: Cascade` on all FK relations |
| **Dangling Notification Pointers** | Notification points to deleted content | `onDelete: SetNull` on `postId` / `commentId` |
| **Accidental Content Deletion** | Loss of posts and metrics | `deletedAt` soft-delete; trigger cascades to comments |
| **Duplicate Likes** | Race condition — two likes on same post | Composite PK `(userId, postId)` rejects at DB level |
| **Duplicate Notifications** | Spam from unlike/re-like cycles | Partial unique indexes on `notifications` per event type |
| **Orphaned Notifications** | LIKE / FOLLOW notif survives unlike / unfollow | Triggers on `likes` and `follows` DELETE auto-clean notifications |
| **Broken Soft-Delete Cascade** | Post hidden but child comments still visible | `AFTER UPDATE` trigger propagates `deleted_at` to `comments` |
| **Self-Interaction** | User follows / blocks / notifies themselves | `CHECK` constraints at DB level; application guard as second layer |
| **N+1 on Counts** | Like/comment count per post fetched in a loop | `_count` aggregate inside `findMany` — single query |
| **Notification Count Bottleneck** | Slow badge queries under high volume | `@@index([receiverId, isRead])` narrows scan to unread rows |
| **Plain-text Passwords** | Catastrophic on breach | Argon2id hashing in service layer before any Prisma write |
| **Blocked User Visibility** | Blocked user appears in feed | `blockedBy: { none: { blockerId: userId } }` in every feed query |
| **Invalid Input at DB Level** | Malformed usernames or empty posts stored | `CHECK` constraints on `username`, post content, comment content |
| **updated_at Drift** | Direct SQL scripts bypass Prisma's @updatedAt | `BEFORE UPDATE` trigger enforces `updated_at = NOW()` at DB level |

---

## 8. Implementation Checklist

- [ ] `brew services start postgresql` — verify Postgres is running
- [ ] `psql postgres -c "CREATE DATABASE social;"` — provision database
- [ ] Create `.env` with `DATABASE_URL=postgresql://postgres@localhost:5432/social`
- [ ] Confirm `.env.local` has the same `DATABASE_URL`
- [ ] `bun add prisma @prisma/client` — install Prisma
- [ ] `bunx prisma init` — scaffold `prisma/` directory
- [ ] Replace generated `schema.prisma` with the schema in Section 3
- [ ] `bunx prisma migrate dev --name init_social_schema` — apply Prisma schema
- [ ] Create `prisma/migrations/<timestamp>_constraints_and_triggers/migration.sql` — add all SQL from Section 4
- [ ] `bunx prisma migrate dev --name constraints_and_triggers` — apply raw SQL
- [ ] `bunx prisma generate` — generate type-safe Prisma Client
- [ ] `bunx prisma studio` — verify all tables, columns, and relations
- [ ] Add `lib/prisma.ts` singleton to avoid connection pool exhaustion in Next.js dev mode
