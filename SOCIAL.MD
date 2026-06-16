# Social Media Platform — Backend Design

| Field | Value |
|---|---|
| **What we're building** | The database backbone for a social network (think Twitter/Instagram) |
| **Where it runs** | Your Mac, locally during development |
| **Database** | PostgreSQL — the industry-standard relational database |
| **ORM** | Prisma — a library that lets you write TypeScript instead of raw SQL |
| **Package manager** | Bun (faster alternative to npm) |

---

## 1. Setting Up the Database Locally

### Step 1 — Start PostgreSQL

```bash
# Start the PostgreSQL database server
brew services start postgresql

# Open the PostgreSQL command line
psql postgres
```

### Step 2 — Create the Database

Run this inside the `psql` prompt to create a fresh empty database called `social`:

```sql
CREATE DATABASE social;
\l     -- list all databases (to confirm it was created)
\q     -- quit
```

### Step 3 — Tell the App Where the Database Lives

We need a connection string — an address that tells the app how to reach the database. Two separate files need this because Prisma (the ORM) and Next.js (the web framework) each read from a different file:

**`.env`** — read by Prisma when you run migration commands:
```
DATABASE_URL=postgresql://postgres@localhost:5432/social
```

**`.env.local`** — read by Next.js when the app is running:
```
DATABASE_URL=postgresql://postgres@localhost:5432/social
```

> Both files have the same value. Add both to `.gitignore` — never commit credentials.

---

## 2. What Gets Stored — The Big Picture

Think of the database as a collection of linked spreadsheets. Each sheet (called a "table") stores one type of thing. Here's how they relate:

```
                    ┌──────────────┐
                    │    USERS     │  ← Every person on the platform
                    └──────────────┘
                  /    |      |     \
                 /     |      |      \
          POSTS    FOLLOWS  BLOCKS  NOTIFICATIONS
         (feed)   (who you  (who    (alerts: likes,
                  follow)   you     comments, follows)
                            blocked)
           |
       ┌───┴───┐
    COMMENTS  LIKES
       |
  COMMENT LIKES
```

Here's what each table does in plain terms:

**Users** — stores everyone's account. Username, email, password (hashed — never stored as plain text), bio, profile photo, and whether the account is verified or active.

**Follows** — records who follows whom. If Alice follows Bob, there's one row: `follower=Alice, following=Bob`. This is one-way (like Twitter) — Bob doesn't automatically follow Alice back.

**Posts** — stores all posts. A post can be text, images/videos, or both. Posts are never truly deleted — instead a `deleted_at` timestamp is stamped on them (called "soft delete"), so we can recover them if needed.

**Likes** — tracks who liked which post. Each like is one row. The database enforces that you can only like a post once.

**Comments** — text replies on posts. Comments support one level of threading (replying to a reply). Also soft-deleted, not hard-deleted.

**CommentLikes** — same as Likes, but for comments instead of posts.

**Blocks** — records who has blocked whom. Every feed query checks this so blocked users never appear in your feed.

**Notifications** — the alert inbox. Stores events like "Alice liked your post", "Bob started following you", "Carol replied to your comment". Notifications are never deleted when content is deleted — instead the post/comment reference is just set to null, so you keep the history but don't get a broken link.

---

## 3. The Database Schema

This is the actual Prisma schema — the formal definition of all tables, columns, and how they link together. Paste this into `prisma/schema.prisma`.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ── Enums — fixed lists of allowed values ─────────────────────────────────────

enum Role {
  USER        // regular account
  ADMIN       // can manage the platform
  MODERATOR   // can review flagged content
}

enum NotificationType {
  LIKE          // someone liked your post
  COMMENT_LIKE  // someone liked your comment
  COMMENT       // someone commented on your post
  FOLLOW        // someone followed you
}

// ── Models — one model = one database table ───────────────────────────────────

model User {
  id           String   @id @default(uuid())     // unique ID, auto-generated
  username     String   @unique @db.VarChar(30)  // max 30 chars, must be unique
  email        String   @unique @db.VarChar(255)
  passwordHash String   @map("password_hash")    // NEVER store plain-text passwords
  bio          String?  @db.VarChar(160)         // optional, max 160 chars (Twitter-style)
  avatarUrl    String?  @map("avatar_url")       // link to profile photo
  isVerified   Boolean  @default(false) @map("is_verified")  // blue checkmark
  isActive     Boolean  @default(true)  @map("is_active")    // false = account suspended
  role         Role     @default(USER)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt      @map("updated_at")

  // These are virtual links — not columns in the DB, just how Prisma navigates relationships
  posts                 Post[]
  comments              Comment[]
  likes                 Like[]
  commentLikes          CommentLike[]
  followers             Follow[]       @relation("FollowerRelation")   // people who follow me
  following             Follow[]       @relation("FollowingRelation")  // people I follow
  blocking              Block[]        @relation("BlockerRelation")
  blockedBy             Block[]        @relation("BlockedRelation")
  notificationsReceived Notification[] @relation("NotificationReceiver")
  notificationsSent     Notification[] @relation("NotificationSender")

  @@index([username])   // speeds up username lookups (login, profile pages)
  @@map("users")        // the actual table name in Postgres
}

model Follow {
  followerId  String   @map("follower_id")   // the person doing the following
  followingId String   @map("following_id")  // the person being followed
  createdAt   DateTime @default(now()) @map("created_at")

  follower  User @relation("FollowerRelation",  fields: [followerId],  references: [id], onDelete: Cascade)
  following User @relation("FollowingRelation", fields: [followingId], references: [id], onDelete: Cascade)

  // Using both IDs together as the primary key means the same follow can't exist twice
  @@id([followerId, followingId])
  @@index([followingId])  // speeds up "who follows user X?" queries
  @@map("follows")
  // Database rule (added in Section 4): you cannot follow yourself
}

model Block {
  blockerId String   @map("blocker_id")  // the person who blocked someone
  blockedId String   @map("blocked_id")  // the person who was blocked
  createdAt DateTime @default(now()) @map("created_at")

  blocker User @relation("BlockerRelation", fields: [blockerId], references: [id], onDelete: Cascade)
  blocked User @relation("BlockedRelation", fields: [blockedId], references: [id], onDelete: Cascade)

  @@id([blockerId, blockedId])
  @@index([blockedId])  // speeds up "has this person blocked me?" checks on every feed load
  @@map("blocks")
  // Database rule (added in Section 4): you cannot block yourself
}

model Post {
  id        String    @id @default(uuid())
  content   String?   @db.VarChar(2200)   // text is optional — you can post images only
  mediaUrls String[]  @map("media_urls")  // list of image/video URLs in display order
  authorId  String    @map("author_id")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt      @map("updated_at")
  deletedAt DateTime? @map("deleted_at") // null = visible; set = hidden (soft delete)

  author        User           @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments      Comment[]
  likes         Like[]
  notifications Notification[]

  // Feed index: get all posts by a user sorted newest first
  @@index([authorId, createdAt(sort: Desc)])
  @@map("posts")
  // Database rule (Section 4): a post must have text OR at least one image
  // A faster index for active posts only is added as raw SQL in Section 4
}

model Comment {
  id        String    @id @default(uuid())
  content   String    @db.VarChar(1000)
  authorId  String    @map("author_id")
  postId    String    @map("post_id")
  parentId  String?   @map("parent_id")  // if set, this comment is a reply to another comment
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt      @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  author        User          @relation(fields: [authorId], references: [id], onDelete: Cascade)
  post          Post          @relation(fields: [postId],   references: [id], onDelete: Cascade)
  parent        Comment?      @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies       Comment[]     @relation("CommentReplies")
  commentLikes  CommentLike[]
  notifications Notification[]

  @@index([postId, createdAt(sort: Asc)])              // load all comments on a post oldest-first
  @@index([authorId, createdAt(sort: Desc)])            // show all comments made by a user on their profile
  @@index([parentId])                                   // load all replies to a specific comment
  @@map("comments")
}

model Like {
  userId    String   @map("user_id")
  postId    String   @map("post_id")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  // Using both IDs as the primary key prevents liking the same post twice, at the database level
  @@id([userId, postId])
  @@map("likes")
  // When a like is deleted (unlike), a database trigger auto-removes the notification (Section 4)
}

model CommentLike {
  userId    String   @map("user_id")
  commentId String   @map("comment_id")
  createdAt DateTime @default(now()) @map("created_at")

  user    User    @relation(fields: [userId],    references: [id], onDelete: Cascade)
  comment Comment @relation(fields: [commentId], references: [id], onDelete: Cascade)

  @@id([userId, commentId])
  @@map("comment_likes")
}

model Notification {
  id         String           @id @default(uuid())
  type       NotificationType  // LIKE, COMMENT, FOLLOW, or COMMENT_LIKE
  isRead     Boolean          @default(false) @map("is_read")
  receiverId String           @map("receiver_id")  // who gets this notification
  notifierId String           @map("notifier_id")  // who triggered it
  postId     String?          @map("post_id")      // which post (for LIKE / COMMENT)
  commentId  String?          @map("comment_id")   // which comment (for COMMENT / COMMENT_LIKE)
  createdAt  DateTime         @default(now()) @map("created_at")

  receiver User     @relation("NotificationReceiver", fields: [receiverId], references: [id], onDelete: Cascade)
  notifier User     @relation("NotificationSender",   fields: [notifierId], references: [id], onDelete: Cascade)
  // If the post/comment is deleted, the reference becomes null — but the notification stays
  post     Post?    @relation(fields: [postId],    references: [id], onDelete: SetNull)
  comment  Comment? @relation(fields: [commentId], references: [id], onDelete: SetNull)

  @@index([receiverId, isRead])                    // fast unread badge count
  @@index([receiverId, createdAt(sort: Desc)])     // notification feed, newest first
  @@map("notifications")
  // Deduplication and self-notification rules are added as raw SQL in Section 4
}
```

---

## 4. Rules That Prisma Can't Express (Raw SQL)

Prisma's schema language handles most things, but some rules have to be written directly in SQL. These go into a custom migration file at:

`prisma/migrations/<timestamp>_constraints_and_triggers/migration.sql`

### 4.1 Validation Rules (Check Constraints)

These are database-level rules that reject bad data before it's ever saved. Think of them as the last line of defense — they fire even if the application code has a bug.

```sql
-- You cannot follow yourself
ALTER TABLE follows
  ADD CONSTRAINT no_self_follow
  CHECK (follower_id <> following_id);

-- You cannot block yourself
ALTER TABLE blocks
  ADD CONSTRAINT no_self_block
  CHECK (blocker_id <> blocked_id);

-- A post must have text, or at least one image/video — not both empty
ALTER TABLE posts
  ADD CONSTRAINT post_has_content
  CHECK (content IS NOT NULL OR array_length(media_urls, 1) > 0);

-- A comment cannot be blank or only whitespace
ALTER TABLE comments
  ADD CONSTRAINT comment_not_empty
  CHECK (length(trim(content)) > 0);

-- Usernames: lowercase letters, numbers, and underscores only, 3 to 30 characters
ALTER TABLE users
  ADD CONSTRAINT valid_username
  CHECK (username ~ '^[a-z0-9_]{3,30}$');

-- You cannot send a notification to yourself (e.g. liking your own post)
ALTER TABLE notifications
  ADD CONSTRAINT no_self_notification
  CHECK (notifier_id <> receiver_id);
```

### 4.2 Faster Indexes for Common Queries

A regular index covers all rows. A **partial index** only covers the rows you actually query — so it's smaller, faster to build, and faster to search.

```sql
-- Feed index: only index posts that haven't been deleted.
-- At scale, deleted posts could be 20–30% of the table — this ignores them entirely.
CREATE INDEX posts_active_feed_idx
  ON posts (author_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Prevent duplicate "liked your post" notifications.
-- If someone unlikes and re-likes, they shouldn't get two notifications.
CREATE UNIQUE INDEX notif_like_unique
  ON notifications (notifier_id, receiver_id, post_id)
  WHERE type = 'LIKE';

-- Prevent duplicate "started following you" notifications.
CREATE UNIQUE INDEX notif_follow_unique
  ON notifications (notifier_id, receiver_id)
  WHERE type = 'FOLLOW';

-- Prevent duplicate "liked your comment" notifications.
CREATE UNIQUE INDEX notif_comment_like_unique
  ON notifications (notifier_id, receiver_id, comment_id)
  WHERE type = 'COMMENT_LIKE';
```

### 4.3 Automatic Actions (Triggers)

A **trigger** is a piece of SQL that the database runs automatically when something happens — no application code needed. This ensures the action happens even if the call comes from a migration script, admin tool, or any other path that bypasses the app.

---

#### When a post is deleted, automatically hide its comments too

When you soft-delete a post (set `deleted_at`), all comments on that post should disappear too. Without this trigger, the post would be hidden but its comments would still be visible and queryable.

```sql
CREATE OR REPLACE FUNCTION cascade_post_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fires when deleted_at changes from null to a timestamp (i.e. first deletion)
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

---

#### When someone unlikes a post, automatically remove the "liked your post" notification

There's no direct database link between a like and its notification (they're different tables), so we can't use Prisma's built-in cascade. This trigger watches for deleted likes and cleans up the matching notification.

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

---

#### When someone unfollows, automatically remove the "started following you" notification

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

---

#### When someone un-likes a comment, automatically remove the "liked your comment" notification

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

---

#### Keep `updated_at` accurate even when SQL scripts bypass the app

Prisma automatically updates `updated_at` when you update a row through the app. But if a developer runs a migration script or admin tool directly against the database, Prisma is bypassed. This trigger guarantees the timestamp is always current, regardless of where the update came from.

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

## 5. Handling Multiple Steps Atomically (Transactions)

Some actions touch more than one table. For example, liking a post creates a row in `likes` AND a row in `notifications`. If the app crashes between the two steps, you'd end up with a like that has no notification — or vice versa.

A **transaction** wraps multiple operations into a single unit: either all of them succeed, or none of them do. The database is never left in a half-done state.

### 5.1 Liking a Post

```typescript
async function likePost(actorId: string, postId: string) {
  // First, find out who wrote the post so we know who to notify
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    select: { authorId: true },
  });

  await prisma.$transaction([
    // Step 1: record the like
    // The database rejects this if the user already liked the post (composite primary key)
    prisma.like.create({ data: { userId: actorId, postId } }),

    // Step 2: send a notification — but skip it if you're liking your own post
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

### 5.2 Unliking a Post

```typescript
async function unlikePost(actorId: string, postId: string) {
  // Just delete the like row — the database trigger automatically
  // removes the matching notification for us (no extra code needed)
  await prisma.like.delete({
    where: { userId_postId: { userId: actorId, postId } },
  });
}
```

### 5.3 Following Someone

```typescript
async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) throw new Error('Cannot follow yourself');

  // Both steps succeed or both fail — the user can't be followed without a notification,
  // and a notification can't exist without the follow relationship
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

### 5.4 Unfollowing Someone

```typescript
async function unfollowUser(followerId: string, followingId: string) {
  // Just delete the follow row — the database trigger removes the notification automatically
  await prisma.follow.delete({
    where: { followerId_followingId: { followerId, followingId } },
  });
}
```

### 5.5 Creating a Post

```typescript
async function createPost(authorId: string, data: { content?: string; mediaUrls?: string[] }) {
  // The database CHECK constraint (Section 4.1) rejects this if both content and mediaUrls are empty
  return prisma.post.create({
    data: { authorId, content: data.content, mediaUrls: data.mediaUrls ?? [] },
  });
}
```

### 5.6 Deleting a Post (Soft Delete)

```typescript
async function softDeletePost(postId: string) {
  // We don't actually remove the row — we just stamp a deletion time on it.
  // The database trigger (Section 4.3) automatically stamps the same time on all child comments.
  await prisma.post.update({
    where: { id: postId },
    data:  { deletedAt: new Date() },
  });
}
```

### 5.7 Adding a Comment

```typescript
async function addComment(
  authorId: string,
  postId: string,
  content: string,
  parentId?: string,   // pass this to make it a reply to another comment
) {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    select: { authorId: true },
  });

  return prisma.$transaction(async (tx) => {
    // Step 1: save the comment
    const comment = await tx.comment.create({
      data: { authorId, postId, content, parentId },
    });

    // Step 2: notify the post author — but not if they commented on their own post
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

## 6. Reading Data — Common Queries

### 6.1 Building a User's Feed

This fetches the 20 most recent posts from people a user follows (plus their own posts), in a single database query. It filters out deleted posts and posts from accounts that have blocked the current user.

```typescript
export async function getChronologicalTimelineFeed(userId: string, cursor?: string) {
  return prisma.post.findMany({
    where: {
      deletedAt: null,   // skip hidden/deleted posts
      author: {
        OR: [
          { followers: { some: { followerId: userId } } },  // posts from people I follow
          { id: userId },                                    // my own posts
        ],
        blockedBy: { none: { blockerId: userId } },          // skip blocked accounts
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    // cursor-based pagination: pass the last post's ID to get the next page
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    include: {
      author: { select: { id: true, username: true, avatarUrl: true, isVerified: true } },
      _count: { select: { likes: true, comments: true } },  // like/comment counts in one query
    },
  });
}
```

### 6.2 Unread Notification Count (the Badge Number)

```typescript
export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { receiverId: userId, isRead: false },
  });
}
```

---

## 7. Things That Could Go Wrong — and How We Handle Them

| Scenario | What breaks | How it's prevented |
|---|---|---|
| **Viral account with 10M followers** | The feed query slows down when you follow a massive account | Load feed in pages of 20 (cursor pagination); cache popular timelines in Redis |
| **User account deleted** | All their posts, comments, and likes become orphaned (no owner) | Deleting a user automatically deletes all their content (`onDelete: Cascade`) |
| **Post deleted, notification still points to it** | Notification link is broken | Instead of deleting the notification, the post reference is set to null (`onDelete: SetNull`) |
| **Post deleted, comments still visible** | Comments appear without their parent post | Trigger stamps all child comments with the same `deleted_at` automatically |
| **Double-like race condition** | Two "like" requests arrive at the same time and both succeed | Database composite key physically prevents two likes from the same user on the same post |
| **Unlike then re-like sending duplicate notifications** | User gets two "Alice liked your post" alerts | Partial unique index blocks inserting a duplicate LIKE notification |
| **LIKE notification survives unlike** | "Alice liked your post" notification stays even after Alice unlikes | Trigger on the `likes` table deletes the matching notification automatically |
| **FOLLOW notification survives unfollow** | Same problem for follow events | Trigger on the `follows` table does the same cleanup |
| **Following or blocking yourself** | Weird edge case that breaks feed logic | `CHECK` constraint at the database level rejects it outright |
| **Liking your own post sends you a notification** | You get "you liked your own post" | Application checks `actorId !== authorId`; database `CHECK` also catches it |
| **Loading like/comment counts post by post** | 20 posts = 40 extra database queries (N+1 problem) | `_count` inside `findMany` gets all counts in the original query |
| **Slow notification badge** | Counting all unread notifications is slow at high volume | Index on `(receiverId, isRead)` narrows the count to only unread rows |
| **Plain text password stored in database** | Catastrophic data breach | Passwords are hashed with Argon2id before ever touching the database |
| **Blocked user still appears in feed** | Uncomfortable or harmful experience | Every feed query filters out accounts that have blocked the current user |
| **Empty post or blank username saved** | Bad data gets through if app validation has a bug | `CHECK` constraints at the database level catch it before it's written |
| **`updated_at` not updated by admin scripts** | Timestamps are wrong, audit logs are unreliable | `BEFORE UPDATE` trigger forces `updated_at = NOW()` at the database level |

---

## 8. Setup Checklist

Follow these steps in order to go from a blank machine to a running database:

- [ ] `brew services start postgresql` — make sure Postgres is running
- [ ] `psql postgres -c "CREATE DATABASE social;"` — create the database
- [ ] Create `.env` with `DATABASE_URL=postgresql://postgres@localhost:5432/social`
- [ ] Confirm `.env.local` also has the same `DATABASE_URL`
- [ ] `bun add prisma @prisma/client` — install Prisma
- [ ] `bunx prisma init` — create the `prisma/` directory and starter files
- [ ] Replace the generated `schema.prisma` with the schema from Section 3
- [ ] `bunx prisma migrate dev --name init_social_schema` — create all tables
- [ ] Create `prisma/migrations/<timestamp>_constraints_and_triggers/migration.sql` with all SQL from Section 4
- [ ] `bunx prisma migrate dev --name constraints_and_triggers` — apply the rules and triggers
- [ ] `bunx prisma generate` — generate the TypeScript client
- [ ] `bunx prisma studio` — open the visual DB browser to confirm everything looks right
- [ ] Add `lib/prisma.ts` with a singleton Prisma client (prevents too many DB connections in dev)
