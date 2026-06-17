import { PrismaClient, Role, NotificationType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

// Fixed dev placeholder — not a real hash, never use in production
const DEV_HASH = "$2b$10$devSeedHashPlaceholderXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

async function main() {
  // ── Users ────────────────────────────────────────────────────────────────────

  const [alice, bob, carol, dave, eve, frank, grace, admin] = await Promise.all([
    prisma.user.upsert({
      where: { email: "alice@example.com" },
      update: {},
      create: {
        username: "alice",
        email: "alice@example.com",
        passwordHash: DEV_HASH,
        bio: "Building distributed systems one service at a time.",
        isVerified: true,
        role: Role.USER,
      },
    }),
    prisma.user.upsert({
      where: { email: "bob@example.com" },
      update: {},
      create: {
        username: "bob_dev",
        email: "bob@example.com",
        passwordHash: DEV_HASH,
        bio: "Backend engineer. Loves Postgres and coffee.",
        isVerified: true,
        role: Role.USER,
      },
    }),
    prisma.user.upsert({
      where: { email: "carol@example.com" },
      update: {},
      create: {
        username: "carol_codes",
        email: "carol@example.com",
        passwordHash: DEV_HASH,
        bio: "Full-stack. Strong opinions, loosely held.",
        isVerified: false,
        role: Role.USER,
      },
    }),
    prisma.user.upsert({
      where: { email: "dave@example.com" },
      update: {},
      create: {
        username: "dave42",
        email: "dave@example.com",
        passwordHash: DEV_HASH,
        bio: null,
        isVerified: false,
        role: Role.USER,
      },
    }),
    prisma.user.upsert({
      where: { email: "eve@example.com" },
      update: {},
      create: {
        username: "eve_infra",
        email: "eve@example.com",
        passwordHash: DEV_HASH,
        bio: "SRE. If it's not monitored, it's not in production.",
        isVerified: true,
        role: Role.USER,
      },
    }),
    prisma.user.upsert({
      where: { email: "frank@example.com" },
      update: {},
      create: {
        username: "frankly_frank",
        email: "frank@example.com",
        passwordHash: DEV_HASH,
        bio: "Just here for the memes and the Kafka topics.",
        isVerified: false,
        role: Role.USER,
      },
    }),
    prisma.user.upsert({
      where: { email: "grace@example.com" },
      update: {},
      create: {
        username: "grace_hops",
        email: "grace@example.com",
        passwordHash: DEV_HASH,
        bio: "Named after Admiral Hopper. Living up to it.",
        isVerified: true,
        role: Role.MODERATOR,
      },
    }),
    prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        username: "sysadmin",
        email: "admin@example.com",
        passwordHash: DEV_HASH,
        bio: "Platform admin.",
        isVerified: true,
        role: Role.ADMIN,
      },
    }),
  ]);

  console.log("✓ users");

  // ── Follows ───────────────────────────────────────────────────────────────────

  const followPairs = [
    [alice.id, bob.id],
    [alice.id, grace.id],
    [bob.id, alice.id],
    [bob.id, carol.id],
    [carol.id, alice.id],
    [carol.id, eve.id],
    [dave.id, alice.id],
    [dave.id, bob.id],
    [eve.id, grace.id],
    [frank.id, alice.id],
  ];

  await Promise.all(
    followPairs.map(([followerId, followingId]) =>
      prisma.follow.upsert({
        where: { followerId_followingId: { followerId, followingId } },
        update: {},
        create: { followerId, followingId },
      })
    )
  );

  console.log("✓ follows");

  // ── Blocks ─────────────────────────────────────────────────────────────────

  await Promise.all([
    prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: alice.id, blockedId: frank.id } },
      update: {},
      create: { blockerId: alice.id, blockedId: frank.id },
    }),
    prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: eve.id, blockedId: dave.id } },
      update: {},
      create: { blockerId: eve.id, blockedId: dave.id },
    }),
  ]);

  console.log("✓ blocks");

  // ── Posts ─────────────────────────────────────────────────────────────────

  const postData = [
    // alice — 3 posts
    {
      id: "post-alice-1",
      authorId: alice.id,
      content:
        "Load balancers are the unsung heroes of distributed systems. Round-robin works great until your endpoints aren't homogeneous. Least-connections is usually the smarter default.",
    },
    {
      id: "post-alice-2",
      authorId: alice.id,
      content:
        "Hot take: most teams adopt Kafka before they actually need it. A simple Postgres-backed queue handles 95% of use cases with far less operational overhead.",
    },
    {
      id: "post-alice-3",
      authorId: alice.id,
      content:
        "Spent the weekend reading about consistent hashing. The virtual nodes concept is elegant — you get balanced distribution without a full re-hash when a node joins or leaves.",
    },
    // bob — 3 posts
    {
      id: "post-bob-1",
      authorId: bob.id,
      content:
        "Index your foreign keys. Always. I cannot stress this enough. A missing index on a FK column in a 50M-row table will ruin your day in production.",
    },
    {
      id: "post-bob-2",
      authorId: bob.id,
      content:
        "EXPLAIN ANALYZE is your best friend. Nine times out of ten the query plan reveals exactly why your endpoint takes 3 seconds instead of 30ms.",
    },
    {
      id: "post-bob-3",
      authorId: bob.id,
      content:
        "Connection pooling tip: PgBouncer in transaction mode works great for stateless services, but breaks if you use advisory locks or temp tables. Know your workload.",
    },
    // carol — 3 posts
    {
      id: "post-carol-1",
      authorId: carol.id,
      content:
        "URL shorteners are a classic system design question but they're also genuinely interesting. The trickiest part isn't the redirect — it's ensuring global uniqueness at scale without a lock.",
    },
    {
      id: "post-carol-2",
      authorId: carol.id,
      content:
        "Rate limiting is harder than it looks. Fixed window is simple but has the boundary spike problem. Sliding window log is accurate but memory-heavy. Token bucket is usually the right middle ground.",
    },
    {
      id: "post-carol-3",
      authorId: carol.id,
      content: "Just discovered rehype-pretty-code. Never going back to plain markdown code blocks.",
    },
    // dave — 2 posts
    {
      id: "post-dave-1",
      authorId: dave.id,
      content: "Does anyone else find CDN cache invalidation more annoying than naming things?",
    },
    {
      id: "post-dave-2",
      authorId: dave.id,
      content:
        "Finally set up a notification system. The fan-out on write vs fan-out on read debate is real — ended up with a hybrid because my follower counts vary wildly across users.",
    },
    // eve — 3 posts
    {
      id: "post-eve-1",
      authorId: eve.id,
      content:
        "Blob storage design: your app should never care which physical machine holds the bytes. The abstraction layer (think S3 key → object) is what makes geo-replication and redundancy composable.",
    },
    {
      id: "post-eve-2",
      authorId: eve.id,
      content:
        "p99 latency matters more than average latency. Your average could be 50ms while 1% of users wait 5 seconds. Monitor your tails.",
    },
    {
      id: "post-eve-3",
      authorId: eve.id,
      content:
        "Sharding by user ID is simple but creates hot spots if some users are orders-of-magnitude more active. Range-based sharding with periodic rebalancing is more robust.",
    },
    // frank — 2 posts
    {
      id: "post-frank-1",
      authorId: frank.id,
      content: "What if we just put everything in one big table 🙂",
    },
    {
      id: "post-frank-2",
      authorId: frank.id,
      content:
        "Asked the team why we have 14 microservices for a 3-person startup. Meeting still ongoing.",
    },
    // grace — 2 posts
    {
      id: "post-grace-1",
      authorId: grace.id,
      content:
        "Reminder: \"the database is the source of truth\" only holds if your writes are durable. Know your fsync settings and what your cloud provider's storage guarantees actually are.",
    },
    {
      id: "post-grace-2",
      authorId: grace.id,
      content:
        "Chat systems are fascinating from a system design POV. WebSocket fan-out, presence tracking, message ordering — each piece is a distributed systems problem in miniature.",
    },
    // admin — 2 posts
    {
      id: "post-admin-1",
      authorId: admin.id,
      content: "Platform maintenance window scheduled for Sunday 02:00 UTC. Expected downtime: 15 minutes.",
    },
    {
      id: "post-admin-2",
      authorId: admin.id,
      content:
        "Welcome to the platform! A few ground rules: be respectful, cite your sources, and don't spam the feed.",
    },
  ];

  await Promise.all(
    postData.map((p) =>
      prisma.post.upsert({
        where: { id: p.id },
        update: {},
        create: p,
      })
    )
  );

  console.log("✓ posts");

  // ── Comments ──────────────────────────────────────────────────────────────

  // Top-level comments first, then replies (need parent IDs)
  const topComments = [
    {
      id: "comment-1",
      authorId: bob.id,
      postId: "post-alice-1",
      content: "Completely agree on least-connections. We switched from round-robin and latency variance dropped significantly.",
    },
    {
      id: "comment-2",
      authorId: carol.id,
      postId: "post-alice-2",
      content: "The Postgres queue approach is underrated. SKIP LOCKED is genuinely a great primitive.",
    },
    {
      id: "comment-3",
      authorId: eve.id,
      postId: "post-alice-2",
      content: "Counterpoint: once you need replay, exactly-once semantics, or multi-consumer fan-out, Kafka starts earning its keep.",
    },
    {
      id: "comment-4",
      authorId: alice.id,
      postId: "post-bob-1",
      content: "Saved me last quarter. Missing index on a FK caused a sequential scan on 80M rows. Night to remember.",
    },
    {
      id: "comment-5",
      authorId: dave.id,
      postId: "post-bob-2",
      content: "EXPLAIN ANALYZE saved my job once. Not even joking.",
    },
    {
      id: "comment-6",
      authorId: alice.id,
      postId: "post-carol-1",
      content: "Base62 encoding of an auto-increment ID is a clean approach — simple, no collision risk, predictable length growth.",
    },
    {
      id: "comment-7",
      authorId: grace.id,
      postId: "post-carol-2",
      content: "Sliding window counter (approximate with Redis sorted sets) is a nice middle ground if you can tolerate slight inaccuracy.",
    },
    {
      id: "comment-8",
      authorId: alice.id,
      postId: "post-eve-2",
      content: "p999 matters too if you're in fintech or health. The long tail can be contractually significant.",
    },
    {
      id: "comment-9",
      authorId: bob.id,
      postId: "post-frank-1",
      content: "Worked at a place that tried this. We don't talk about it.",
    },
    {
      id: "comment-10",
      authorId: carol.id,
      postId: "post-frank-2",
      content: "Peak startup engineering. The microservices justify themselves eventually, I tell myself.",
    },
    {
      id: "comment-11",
      authorId: dave.id,
      postId: "post-grace-2",
      content: "Presence tracking is the part that always bites you. How do you handle the case where the WebSocket dies without a clean close?",
    },
    {
      id: "comment-12",
      authorId: bob.id,
      postId: "post-eve-1",
      content: "The key abstraction is also what makes multipart uploads composable. Each part is independently addressable.",
    },
  ];

  await Promise.all(
    topComments.map((c) =>
      prisma.comment.upsert({
        where: { id: c.id },
        update: {},
        create: { ...c, parentId: null },
      })
    )
  );

  // Replies
  const replies = [
    {
      id: "comment-13",
      authorId: alice.id,
      postId: "post-alice-2",
      parentId: "comment-3",
      content: "Fair point — I should have said 'before you need multi-consumer fan-out'. The default queue use case rarely needs Kafka.",
    },
    {
      id: "comment-14",
      authorId: eve.id,
      postId: "post-alice-2",
      parentId: "comment-3",
      content: "Exactly. The operational cost is the real tax. Once the team is Kafka-literate it's not bad, but that ramp-up is expensive.",
    },
    {
      id: "comment-15",
      authorId: grace.id,
      postId: "post-grace-2",
      parentId: "comment-11",
      content: "Heartbeat pings + server-side TTL on presence records. If no heartbeat in N seconds, mark offline. Works well in practice.",
    },
  ];

  await Promise.all(
    replies.map((c) =>
      prisma.comment.upsert({
        where: { id: c.id },
        update: {},
        create: c,
      })
    )
  );

  console.log("✓ comments");

  // ── Likes ─────────────────────────────────────────────────────────────────

  const likePairs: [string, string][] = [
    [bob.id, "post-alice-1"],
    [carol.id, "post-alice-1"],
    [dave.id, "post-alice-1"],
    [eve.id, "post-alice-2"],
    [grace.id, "post-alice-2"],
    [alice.id, "post-bob-1"],
    [carol.id, "post-bob-1"],
    [eve.id, "post-bob-2"],
    [alice.id, "post-carol-1"],
    [bob.id, "post-carol-2"],
    [grace.id, "post-carol-2"],
    [alice.id, "post-eve-2"],
    [bob.id, "post-eve-2"],
    [carol.id, "post-frank-2"],
    [alice.id, "post-frank-2"],
    [bob.id, "post-grace-2"],
    [carol.id, "post-grace-1"],
    [dave.id, "post-frank-1"],
  ];

  await Promise.all(
    likePairs.map(([userId, postId]) =>
      prisma.like.upsert({
        where: { userId_postId: { userId, postId } },
        update: {},
        create: { userId, postId },
      })
    )
  );

  console.log("✓ likes");

  // ── Comment Likes ─────────────────────────────────────────────────────────

  const commentLikePairs: [string, string][] = [
    [alice.id, "comment-3"],
    [carol.id, "comment-3"],
    [bob.id, "comment-2"],
    [alice.id, "comment-7"],
    [bob.id, "comment-9"],
    [carol.id, "comment-9"],
    [dave.id, "comment-5"],
    [grace.id, "comment-13"],
  ];

  await Promise.all(
    commentLikePairs.map(([userId, commentId]) =>
      prisma.commentLike.upsert({
        where: { userId_commentId: { userId, commentId } },
        update: {},
        create: { userId, commentId },
      })
    )
  );

  console.log("✓ comment likes");

  // ── Notifications ─────────────────────────────────────────────────────────

  const notifications = [
    // FOLLOW notifications
    { receiverId: bob.id, notifierId: alice.id, type: NotificationType.FOLLOW, postId: null, commentId: null },
    { receiverId: grace.id, notifierId: alice.id, type: NotificationType.FOLLOW, postId: null, commentId: null },
    { receiverId: alice.id, notifierId: bob.id, type: NotificationType.FOLLOW, postId: null, commentId: null },
    { receiverId: carol.id, notifierId: bob.id, type: NotificationType.FOLLOW, postId: null, commentId: null },
    { receiverId: eve.id, notifierId: carol.id, type: NotificationType.FOLLOW, postId: null, commentId: null },
    // LIKE notifications (post author gets notified)
    { receiverId: alice.id, notifierId: bob.id, type: NotificationType.LIKE, postId: "post-alice-1", commentId: null },
    { receiverId: alice.id, notifierId: carol.id, type: NotificationType.LIKE, postId: "post-alice-1", commentId: null },
    { receiverId: alice.id, notifierId: eve.id, type: NotificationType.LIKE, postId: "post-alice-2", commentId: null },
    { receiverId: bob.id, notifierId: alice.id, type: NotificationType.LIKE, postId: "post-bob-1", commentId: null },
    { receiverId: carol.id, notifierId: bob.id, type: NotificationType.LIKE, postId: "post-carol-2", commentId: null },
    { receiverId: eve.id, notifierId: alice.id, type: NotificationType.LIKE, postId: "post-eve-2", commentId: null },
    // COMMENT notifications
    { receiverId: alice.id, notifierId: bob.id, type: NotificationType.COMMENT, postId: "post-alice-1", commentId: "comment-1" },
    { receiverId: alice.id, notifierId: carol.id, type: NotificationType.COMMENT, postId: "post-alice-2", commentId: "comment-2" },
    { receiverId: bob.id, notifierId: alice.id, type: NotificationType.COMMENT, postId: "post-bob-1", commentId: "comment-4" },
    // COMMENT_LIKE notifications (comment author gets notified)
    { receiverId: eve.id, notifierId: alice.id, type: NotificationType.COMMENT_LIKE, postId: "post-alice-2", commentId: "comment-3" },
    { receiverId: alice.id, notifierId: bob.id, type: NotificationType.COMMENT_LIKE, postId: "post-alice-2", commentId: "comment-2" },
  ];

  await Promise.all(
    notifications.map((n) =>
      prisma.notification.upsert({
        where: {
          receiverId_notifierId_type_postId_commentId: {
            receiverId: n.receiverId,
            notifierId: n.notifierId,
            type: n.type,
            postId: n.postId,
            commentId: n.commentId,
          },
        },
        update: {},
        create: n,
      })
    )
  );

  console.log("✓ notifications");
  console.log("\n🌱 Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
