export default function Home() {
  return (
    <div className="container max-w-4xl py-16 space-y-16">

      {/* ── What is System Design? ──────────────────────────────── */}
      <section className="animate-fade-in-up">
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight mb-4 text-foreground">
          What is System Design?
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-4">
          System design is the process of defining the architecture, components, modules, and data flow of a system to satisfy a set of requirements. It&apos;s not about finding a single correct answer — it&apos;s about reasoning through trade-offs, constraints, and scalability concerns to arrive at a defensible architecture.
        </p>
        <p className="text-muted-foreground text-base leading-relaxed">
          Whether you&apos;re designing a URL shortener or a global social network, the same structured thinking applies: break the problem into parts, understand each part deeply, and then reason about how they connect.
        </p>
      </section>

      {/* ── How to Approach a Problem ───────────────────────────── */}
      <section className="animate-fade-in-up" style={{ animationDelay: "80ms" }}>
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight mb-6 text-foreground">
          How to Approach a Problem
        </h2>

        <div className="space-y-4">

          {/* Step 1 */}
          <div className="bg-card border rounded-lg border-l-4 border-l-indigo-400 p-6">
            <div className="flex items-start gap-4">
              <span className="text-indigo-400 font-mono font-bold text-lg leading-none mt-0.5">01</span>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Don&apos;t jump to a solution</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The instinct in system design is to immediately reach for a specific technology or pattern. Resist it. Before writing any box on a diagram, understand what you&apos;re actually trying to build. Clarify requirements, identify scale expectations, and establish constraints. A well-framed problem is halfway solved.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-card border rounded-lg border-l-4 border-l-indigo-400 p-6">
            <div className="flex items-start gap-4">
              <span className="text-indigo-400 font-mono font-bold text-lg leading-none mt-0.5">02</span>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Draw boundaries and expand outward</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Start small — sketch the core boundary of the system. Then expand in every direction simultaneously: database, frontend, backend, load balancer, cache. Don&apos;t tunnel down one path early. Think of it like inflating a balloon — you want even pressure on all sides before you commit to the shape of any one part.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-card border rounded-lg border-l-4 border-l-indigo-400 p-6">
            <div className="flex items-start gap-4">
              <span className="text-indigo-400 font-mono font-bold text-lg leading-none mt-0.5">03</span>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Split into subcomponents and features</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Decompose the system into discrete, independently reasoned pieces. A large system like Facebook isn&apos;t one design — it&apos;s dozens of smaller ones. Identify the major features first, then treat each as a standalone design problem.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Authentication", "Feed", "Notifications", "Messaging", "Search"].map((f) => (
                    <span key={f} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded px-2 py-1 font-mono dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-card border rounded-lg border-l-4 border-l-indigo-400 p-6">
            <div className="flex items-start gap-4">
              <span className="text-indigo-400 font-mono font-bold text-lg leading-none mt-0.5">04</span>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Dissect each component deeply</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Once you have features, dig into each one. Take the Feed as an example — it&apos;s not just a database lookup. It requires a web server with load balancing, a database layer, an aggregator to collect posts from followed accounts, and a generator to pre-compute feeds. Each of these might need its own sub-design.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── The Four Pillars ────────────────────────────────────── */}
      <section className="animate-fade-in-up" style={{ animationDelay: "160ms" }}>
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight mb-2 text-foreground">
          The Four Pillars
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          For every subcomponent you design, evaluate it through these four lenses.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">

          <div className="bg-card border rounded-lg p-5 border-l-4 border-l-emerald-400">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="text-emerald-500">◈</span> Storage &amp; Caching
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              How and where is data stored? What access patterns does it serve? Which parts benefit from a cache layer? Think about consistency requirements — can reads be slightly stale, or must they be fresh?
            </p>
          </div>

          <div className="bg-card border rounded-lg p-5 border-l-4 border-l-emerald-400">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="text-emerald-500">◈</span> Scaling &amp; Fault Tolerance
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              How does this component scale from 1 to 1 million users? What happens when a node crashes? Load balancers, replication, and horizontal scaling are your tools here. Design for failure as a default.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-5 border-l-4 border-l-emerald-400">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="text-emerald-500">◈</span> Async Processing
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              What work can be deferred or delegated? Pre-generating a user&apos;s feed before they open the app, or offloading email delivery to a background queue — async processing is how you keep hot paths fast.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-5 border-l-4 border-l-emerald-400">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="text-emerald-500">◈</span> Communication
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              How do components talk to each other? REST and HTTP for external APIs, gRPC for internal service-to-service calls, TCP for low-latency streams, or event queues for decoupled producers and consumers.
            </p>
          </div>

        </div>
      </section>

      {/* ── Worked Example ──────────────────────────────────────── */}
      <section className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight mb-2 text-foreground">
          Worked Example: Design Facebook
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Let&apos;s walk through the decomposition strategy in practice.
        </p>

        <div className="space-y-3">

          {/* Level 1 */}
          <div className="bg-card border rounded-lg p-5">
            <h3 className="font-semibold text-foreground text-sm mb-3 uppercase tracking-wide text-muted-foreground">Step 1 — Identify features</h3>
            <div className="flex flex-wrap gap-2">
              {["Authentication", "News Feed", "Notifications", "Messaging", "Search", "Profile"].map((f) => (
                <span key={f} className="text-xs bg-muted text-foreground border rounded px-2 py-1 font-mono">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Level 2 */}
          <div className="bg-card border rounded-lg p-5">
            <h3 className="font-semibold text-foreground text-sm mb-3 uppercase tracking-wide text-muted-foreground">Step 2 — Dissect one feature: News Feed</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: "Web Server", note: "Serves feed requests; sits behind a load balancer" },
                { name: "Load Balancer", note: "Distributes traffic; needs health checks and routing logic" },
                { name: "Database", note: "Stores posts, reactions, and user graph edges" },
                { name: "Aggregator", note: "Collects posts from all accounts a user follows" },
                { name: "Feed Generator", note: "Pre-computes ranked feeds and stores them for fast retrieval" },
              ].map((c) => (
                <div key={c.name} className="bg-muted/50 rounded p-3">
                  <p className="font-mono text-xs font-semibold text-foreground mb-1">{c.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Level 3 */}
          <div className="bg-card border rounded-lg p-5">
            <h3 className="font-semibold text-foreground text-sm mb-3 uppercase tracking-wide text-muted-foreground">Step 3 — Go deeper: Feed Generator</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              The generator itself decomposes further. It needs to pull the user&apos;s follower list, fetch recent posts from each followed account, rank and merge them, then write the result to a fast-access store like Redis.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Post Service", "Followers Service", "Ranker / Merger", "Feed Cache (Redis)"].map((c) => (
                <span key={c} className="text-xs bg-violet-50 text-violet-700 border border-violet-200 rounded px-2 py-1 font-mono dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800">
                  {c}
                </span>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Remember ────────────────────────────────────────────── */}
      <section className="animate-fade-in-up" style={{ animationDelay: "320ms" }}>
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight mb-6 text-foreground">
          Remember
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border rounded-lg p-5 border-t-2 border-t-indigo-400">
            <h3 className="font-semibold text-foreground mb-2">Big problem → Top-down</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              If you&apos;ve been handed a broad, open-ended problem (&quot;Design Twitter&quot;), start by defining features at the top level. Then work downward — one feature at a time, fully designed before moving to the next.
            </p>
          </div>
          <div className="bg-card border rounded-lg p-5 border-t-2 border-t-emerald-400">
            <h3 className="font-semibold text-foreground mb-2">Specific problem → Bottom-up</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              If you&apos;ve been dropped into a specific component (&quot;Design the feed generation pipeline&quot;), start at the lowest level and build upward — understand the atomic pieces before composing them into a larger system.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
