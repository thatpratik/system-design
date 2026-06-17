import { PrismaClient, Role, NotificationType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

// Fixed dev placeholder — not a real hash, never use in production
const DEV_HASH = "$2b$10$devSeedHashPlaceholderXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

async function main() {
  // ── Users (idempotent via upsert) ─────────────────────────────────────────

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

  // ── Follows ───────────────────────────────────────────────────────────────

  await Promise.all([
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
  ].map(([followerId, followingId]) =>
    prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      update: {},
      create: { followerId, followingId },
    })
  ));

  console.log("✓ follows");

  // ── Blocks ────────────────────────────────────────────────────────────────

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

  // ── Posts — delete existing seed posts then recreate ─────────────────────
  // (posts cascade-delete comments, likes, comment_likes, notifications)

  await prisma.post.deleteMany({
    where: { authorId: { in: [alice.id, bob.id, carol.id, dave.id, eve.id, frank.id, grace.id, admin.id] } },
  });

  const [
    aliceP1, aliceP2, aliceP3,
    bobP1, bobP2, bobP3,
    carolP1, carolP2, carolP3,
    daveP1, daveP2,
    eveP1, eveP2, eveP3,
    frankP1, frankP2,
    graceP1, graceP2,
    adminP1, adminP2,
  ] = await Promise.all([
    prisma.post.create({ data: { authorId: alice.id, content: "Load balancers are the unsung heroes of distributed systems. Round-robin works great until your endpoints aren't homogeneous. Least-connections is usually the smarter default." } }),
    prisma.post.create({ data: { authorId: alice.id, content: "Hot take: most teams adopt Kafka before they actually need it. A simple Postgres-backed queue handles 95% of use cases with far less operational overhead." } }),
    prisma.post.create({ data: { authorId: alice.id, content: "Spent the weekend reading about consistent hashing. The virtual nodes concept is elegant — you get balanced distribution without a full re-hash when a node joins or leaves." } }),
    prisma.post.create({ data: { authorId: bob.id, content: "Index your foreign keys. Always. I cannot stress this enough. A missing index on a FK column in a 50M-row table will ruin your day in production." } }),
    prisma.post.create({ data: { authorId: bob.id, content: "EXPLAIN ANALYZE is your best friend. Nine times out of ten the query plan reveals exactly why your endpoint takes 3 seconds instead of 30ms." } }),
    prisma.post.create({ data: { authorId: bob.id, content: "Connection pooling tip: PgBouncer in transaction mode works great for stateless services, but breaks if you use advisory locks or temp tables. Know your workload." } }),
    prisma.post.create({ data: { authorId: carol.id, content: "URL shorteners are a classic system design question but they're also genuinely interesting. The trickiest part isn't the redirect — it's ensuring global uniqueness at scale without a lock." } }),
    prisma.post.create({ data: { authorId: carol.id, content: "Rate limiting is harder than it looks. Fixed window is simple but has the boundary spike problem. Sliding window log is accurate but memory-heavy. Token bucket is usually the right middle ground." } }),
    prisma.post.create({ data: { authorId: carol.id, content: "Just discovered rehype-pretty-code. Never going back to plain markdown code blocks." } }),
    prisma.post.create({ data: { authorId: dave.id, content: "Does anyone else find CDN cache invalidation more annoying than naming things?" } }),
    prisma.post.create({ data: { authorId: dave.id, content: "Finally set up a notification system. The fan-out on write vs fan-out on read debate is real — ended up with a hybrid because my follower counts vary wildly across users." } }),
    prisma.post.create({ data: { authorId: eve.id, content: "Blob storage design: your app should never care which physical machine holds the bytes. The abstraction layer (think S3 key → object) is what makes geo-replication and redundancy composable." } }),
    prisma.post.create({ data: { authorId: eve.id, content: "p99 latency matters more than average latency. Your average could be 50ms while 1% of users wait 5 seconds. Monitor your tails." } }),
    prisma.post.create({ data: { authorId: eve.id, content: "Sharding by user ID is simple but creates hot spots if some users are orders-of-magnitude more active. Range-based sharding with periodic rebalancing is more robust." } }),
    prisma.post.create({ data: { authorId: frank.id, content: "What if we just put everything in one big table 🙂" } }),
    prisma.post.create({ data: { authorId: frank.id, content: "Asked the team why we have 14 microservices for a 3-person startup. Meeting still ongoing." } }),
    prisma.post.create({ data: { authorId: grace.id, content: "Reminder: \"the database is the source of truth\" only holds if your writes are durable. Know your fsync settings and what your cloud provider's storage guarantees actually are." } }),
    prisma.post.create({ data: { authorId: grace.id, content: "Chat systems are fascinating from a system design POV. WebSocket fan-out, presence tracking, message ordering — each piece is a distributed systems problem in miniature." } }),
    prisma.post.create({ data: { authorId: admin.id, content: "Platform maintenance window scheduled for Sunday 02:00 UTC. Expected downtime: 15 minutes." } }),
    prisma.post.create({ data: { authorId: admin.id, content: "Welcome to the platform! A few ground rules: be respectful, cite your sources, and don't spam the feed." } }),
  ]);

  console.log("✓ posts");

  // ── Comments (top-level first, then replies) ──────────────────────────────

  const [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12] = await Promise.all([
    prisma.comment.create({ data: { authorId: bob.id,   postId: aliceP1.id, content: "Completely agree on least-connections. We switched from round-robin and latency variance dropped significantly." } }),
    prisma.comment.create({ data: { authorId: carol.id, postId: aliceP2.id, content: "The Postgres queue approach is underrated. SKIP LOCKED is genuinely a great primitive." } }),
    prisma.comment.create({ data: { authorId: eve.id,   postId: aliceP2.id, content: "Counterpoint: once you need replay, exactly-once semantics, or multi-consumer fan-out, Kafka starts earning its keep." } }),
    prisma.comment.create({ data: { authorId: alice.id, postId: bobP1.id,   content: "Saved me last quarter. Missing index on a FK caused a sequential scan on 80M rows. Night to remember." } }),
    prisma.comment.create({ data: { authorId: dave.id,  postId: bobP2.id,   content: "EXPLAIN ANALYZE saved my job once. Not even joking." } }),
    prisma.comment.create({ data: { authorId: alice.id, postId: carolP1.id, content: "Base62 encoding of an auto-increment ID is a clean approach — simple, no collision risk, predictable length growth." } }),
    prisma.comment.create({ data: { authorId: grace.id, postId: carolP2.id, content: "Sliding window counter (approximate with Redis sorted sets) is a nice middle ground if you can tolerate slight inaccuracy." } }),
    prisma.comment.create({ data: { authorId: alice.id, postId: eveP2.id,   content: "p999 matters too if you're in fintech or health. The long tail can be contractually significant." } }),
    prisma.comment.create({ data: { authorId: bob.id,   postId: frankP1.id, content: "Worked at a place that tried this. We don't talk about it." } }),
    prisma.comment.create({ data: { authorId: carol.id, postId: frankP2.id, content: "Peak startup engineering. The microservices justify themselves eventually, I tell myself." } }),
    prisma.comment.create({ data: { authorId: dave.id,  postId: graceP2.id, content: "Presence tracking is the part that always bites you. How do you handle the case where the WebSocket dies without a clean close?" } }),
    prisma.comment.create({ data: { authorId: bob.id,   postId: eveP1.id,   content: "The key abstraction is also what makes multipart uploads composable. Each part is independently addressable." } }),
  ]);

  // Replies
  await Promise.all([
    prisma.comment.create({ data: { authorId: alice.id, postId: aliceP2.id, parentId: c3.id, content: "Fair point — I should have said 'before you need multi-consumer fan-out'. The default queue use case rarely needs Kafka." } }),
    prisma.comment.create({ data: { authorId: eve.id,   postId: aliceP2.id, parentId: c3.id, content: "Exactly. The operational cost is the real tax. Once the team is Kafka-literate it's not bad, but that ramp-up is expensive." } }),
    prisma.comment.create({ data: { authorId: grace.id, postId: graceP2.id, parentId: c11.id, content: "Heartbeat pings + server-side TTL on presence records. If no heartbeat in N seconds, mark offline. Works well in practice." } }),
  ]);

  console.log("✓ comments");

  // ── Likes ─────────────────────────────────────────────────────────────────

  await Promise.all([
    [bob.id,   aliceP1.id],
    [carol.id, aliceP1.id],
    [dave.id,  aliceP1.id],
    [eve.id,   aliceP2.id],
    [grace.id, aliceP2.id],
    [alice.id, bobP1.id],
    [carol.id, bobP1.id],
    [eve.id,   bobP2.id],
    [alice.id, carolP1.id],
    [bob.id,   carolP2.id],
    [grace.id, carolP2.id],
    [alice.id, eveP2.id],
    [bob.id,   eveP2.id],
    [carol.id, frankP2.id],
    [alice.id, frankP2.id],
    [bob.id,   graceP2.id],
    [carol.id, graceP1.id],
    [dave.id,  frankP1.id],
  ].map(([userId, postId]) =>
    prisma.like.upsert({
      where: { userId_postId: { userId, postId } },
      update: {},
      create: { userId, postId },
    })
  ));

  console.log("✓ likes");

  // ── Comment Likes ─────────────────────────────────────────────────────────

  await Promise.all([
    [alice.id, c3.id],
    [carol.id, c3.id],
    [bob.id,   c2.id],
    [alice.id, c7.id],
    [bob.id,   c9.id],
    [carol.id, c9.id],
    [dave.id,  c5.id],
    [grace.id, c3.id],
  ].map(([userId, commentId]) =>
    prisma.commentLike.upsert({
      where: { userId_commentId: { userId, commentId } },
      update: {},
      create: { userId, commentId },
    })
  ));

  console.log("✓ comment likes");

  // ── Notifications ─────────────────────────────────────────────────────────

  await prisma.notification.createMany({
    skipDuplicates: true,
    data: [
      // FOLLOW
      { receiverId: bob.id,   notifierId: alice.id, type: NotificationType.FOLLOW },
      { receiverId: grace.id, notifierId: alice.id, type: NotificationType.FOLLOW },
      { receiverId: alice.id, notifierId: bob.id,   type: NotificationType.FOLLOW },
      { receiverId: carol.id, notifierId: bob.id,   type: NotificationType.FOLLOW },
      { receiverId: eve.id,   notifierId: carol.id, type: NotificationType.FOLLOW },
      // LIKE
      { receiverId: alice.id, notifierId: bob.id,   type: NotificationType.LIKE,         postId: aliceP1.id },
      { receiverId: alice.id, notifierId: carol.id, type: NotificationType.LIKE,         postId: aliceP1.id },
      { receiverId: alice.id, notifierId: eve.id,   type: NotificationType.LIKE,         postId: aliceP2.id },
      { receiverId: bob.id,   notifierId: alice.id, type: NotificationType.LIKE,         postId: bobP1.id },
      { receiverId: carol.id, notifierId: bob.id,   type: NotificationType.LIKE,         postId: carolP2.id },
      { receiverId: eve.id,   notifierId: alice.id, type: NotificationType.LIKE,         postId: eveP2.id },
      // COMMENT
      { receiverId: alice.id, notifierId: bob.id,   type: NotificationType.COMMENT,      postId: aliceP1.id, commentId: c1.id },
      { receiverId: alice.id, notifierId: carol.id, type: NotificationType.COMMENT,      postId: aliceP2.id, commentId: c2.id },
      { receiverId: bob.id,   notifierId: alice.id, type: NotificationType.COMMENT,      postId: bobP1.id,   commentId: c4.id },
      // COMMENT_LIKE
      { receiverId: eve.id,   notifierId: alice.id, type: NotificationType.COMMENT_LIKE, postId: aliceP2.id, commentId: c3.id },
      { receiverId: carol.id, notifierId: bob.id,   type: NotificationType.COMMENT_LIKE, postId: aliceP2.id, commentId: c2.id },
    ],
  });

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
