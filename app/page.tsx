export default function Home() {
  return (
    <div className="container py-16 space-y-16">

      {/* ── What is System Design? ──────────────────────────────── */}
      <section className="animate-fade-in-up">
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight mb-4 text-foreground">
          What is System Design?
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-4">
          System design is how you figure out what to build before you build it. Not a single right answer — a way of thinking through trade-offs until you land on something you can defend.
        </p>
        <p className="text-muted-foreground text-base leading-relaxed">
          Whether it&apos;s a URL shortener or a global social network, the same approach works: break it down, understand each piece, and reason about how they fit together.
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
                  Before you draw a single box, understand what you&apos;re actually building. Clarify requirements, figure out the scale, know the constraints. The instinct to reach straight for a technology is almost always wrong.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-card border rounded-lg border-l-4 border-l-indigo-400 p-6">
            <div className="flex items-start gap-4">
              <span className="text-indigo-400 font-mono font-bold text-lg leading-none mt-0.5">02</span>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Keep drawing boundaries, start small and expand</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Start from the center and grow outward in every direction — database, frontend, backend, server, load balancer. Don&apos;t go deep on one thing first. Expand evenly before you commit to the shape of any part.
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
                  A big system isn&apos;t one design — it&apos;s many smaller ones. Break it into its major features first. Then treat each feature as its own design problem.
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
                <h3 className="font-semibold text-foreground mb-2">Dissect each component — keep going deeper</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Take Feed. It&apos;s not just a database lookup — it needs a web server, a load balancer, a database, an aggregator to collect posts, and a generator to pre-compute results. Each of those might need its own breakdown too.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── The Four Pillars ────────────────────────────────────── */}
      <section className="animate-fade-in-up" style={{ animationDelay: "160ms" }}>
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight mb-2 text-foreground">
          For Each Subcomponent, Ask Four Things
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Every piece of a system should be evaluated through these lenses.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">

          <div className="bg-card border rounded-lg p-5 border-l-4 border-l-emerald-400">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="text-emerald-500">◈</span> Storage &amp; Caching
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              How and where is the data being stored? What access pattern does it serve? Can reads tolerate being slightly stale, or do they need to be fresh?
            </p>
          </div>

          <div className="bg-card border rounded-lg p-5 border-l-4 border-l-emerald-400">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="text-emerald-500">◈</span> Scaling &amp; Fault Tolerance
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              How does it scale from 1 to 1 million users? What happens when a node crashes? Design for failure by default — load balancers, replication, horizontal scaling.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-5 border-l-4 border-l-emerald-400">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="text-emerald-500">◈</span> Async Processing
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              What work can be delegated or deferred to another process? Pre-generating a feed before the user opens the app, offloading email to a background queue — this is how you keep the hot path fast.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-5 border-l-4 border-l-emerald-400">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="text-emerald-500">◈</span> Communication
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              How do components talk to each other? HTTP/REST for external APIs, gRPC for internal calls, TCP for low-latency, event queues for decoupled producers and consumers.
            </p>
          </div>

        </div>
      </section>

      {/* ── Worked Example ──────────────────────────────────────── */}
      <section className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight mb-2 text-foreground">
          Example: Design Facebook
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Here&apos;s what the decomposition looks like in practice.
        </p>

        <div className="space-y-3">

          {/* Level 1 */}
          <div className="bg-card border rounded-lg p-5">
            <h3 className="font-semibold text-foreground text-sm mb-3 uppercase tracking-wide text-muted-foreground">Step 1 — What are the features?</h3>
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
            <h3 className="font-semibold text-foreground text-sm mb-3 uppercase tracking-wide text-muted-foreground">Step 2 — Dissect one: News Feed</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: "Web Server", note: "Serves feed requests, sits behind a load balancer" },
                { name: "Load Balancer", note: "Distributes traffic, needs health checks and routing logic" },
                { name: "Database", note: "Stores posts, reactions, and the user graph" },
                { name: "Aggregator", note: "Collects posts from everyone a user follows" },
                { name: "Feed Generator", note: "Pre-computes ranked feeds and stores them for fast reads" },
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
              The generator itself breaks down further — it needs to pull the follower list, fetch recent posts from each, rank and merge them, then write to something fast like Redis.
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
            <h3 className="font-semibold text-foreground mb-2">Big problem → top-down</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Given something open-ended like &quot;Design Twitter&quot; — start by listing features at the top level, then design them one by one, top to bottom.
            </p>
          </div>
          <div className="bg-card border rounded-lg p-5 border-t-2 border-t-emerald-400">
            <h3 className="font-semibold text-foreground mb-2">Specific problem → bottom-up</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Dropped into something specific like &quot;Design the feed generation pipeline&quot; — start at the lowest level pieces and build upward, like the feed generator example above.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
