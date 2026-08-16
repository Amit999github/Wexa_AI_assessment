# Interview Prep — Dev Mentor Graph

This is a study document, not part of the submission's public-facing README. It exists
so you can walk an interviewer through every non-obvious decision in this project —
the CognoDB/Neo4j connection, each Cypher query, and the backend/frontend patterns —
in your own words. Read it once end to end, then use the Q&A section at the bottom to
drill the answers.

---

## 1. What CognoDB actually is, and why that matters

CognoDB is a **managed graph database** that speaks **openCypher over the Bolt
protocol** (Bolt versions 5.0–5.4). That single sentence is the answer to "what is
CognoDB and how does it differ from a database you built yourself":

- **Bolt** is the binary wire protocol Neo4j invented for client-driver communication —
  it's not HTTP/REST, it's a persistent, binary, session-oriented protocol designed for
  low-latency query round trips.
- **openCypher** is the open-source specification of the Cypher query language (the
  language you see in every `MATCH (...) RETURN ...` statement in this project).
- Because CognoDB speaks Bolt + openCypher, **any official Neo4j driver works against
  it unmodified** — Python, JavaScript, Go, Java, .NET. There's no CognoDB-specific
  SDK to learn. This project uses the official `neo4j-driver` npm package, exactly as
  you would against a self-hosted Neo4j instance.

**Why this is a good interview point to make yourself:** it shows you understood the
assignment wasn't "learn a new vendor's API," it was "prove you can model and query a
graph" — the vendor is interchangeable because the protocol is standardized.

## 2. How the connection is actually established

Look at `backend/src/config/db.js`. The core of it:

```js
import neo4j from "neo4j-driver";

const driver = neo4j.driver(
  BOLT_URI, // bolt+s://<instance-id>.databases.cognodb.cloud
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD), // basic auth: "cognodb" + generated password
  {
    maxConnectionPoolSize: 20,
    connectionAcquisitionTimeout: 10_000,
  },
);
```

Walk through this in an interview like:

1. **`neo4j.driver(uri, auth, config)` creates a driver instance, not a connection.**
   This is a subtle but important point: the driver itself doesn't open a socket. It's
   a **connection pool factory**. Nothing hits the network until you actually run a
   query or explicitly call `verifyConnectivity()`.
2. **The URI scheme (`bolt+s://`) encodes the transport.** The `+s` suffix means
   "Bolt over TLS" — encrypted, like `https` vs `http`. CognoDB requires this since
   it's a hosted, internet-facing instance.
3. **Auth is HTTP-basic-style, not a token/JWT.** `neo4j.auth.basic(user, password)` —
   simple username/password, sent once per connection and cached by the driver.
4. **The driver pools connections internally.** `maxConnectionPoolSize: 20` caps how
   many physical Bolt connections the driver keeps open at once; it hands them out to
   sessions as needed and returns them to the pool when a session closes. This is why
   you create the driver **once, at module load time**, and reuse it for the life of
   the process — never create a new driver per request.

### Sessions vs. the driver

This project opens **one session per request** (see `getSession()` in `db.js`, called
at the top of every service function) and always closes it in a `finally` block:

```js
export function getSession() {
  return driver.session();
}
```

```js
const session = getSession();
try {
  const result = await session.executeRead((tx) => tx.run(cypher, params));
  return result.records.map((r) => r.toObject());
} finally {
  await session.close();
}
```

**Why a session per request and not a session per app?** A `Session` is a lightweight,
stateful, single-threaded conversation with the database — it's cheap to open and
close, and Neo4j's own docs explicitly recommend against sharing one session across
concurrent operations. The **driver** is the expensive, long-lived thing (it owns the
connection pool); the **session** is the cheap, short-lived thing borrowed from that
pool for the duration of one unit of work.

**`executeRead` vs `executeWrite`:** the driver distinguishes read and write
transactions. `executeRead` is used for every query in `services/` because they're all
`MATCH ... RETURN`; the seed script uses `executeWrite` because it runs `MERGE`
statements that mutate the graph. This isn't just documentation — in a real Neo4j
cluster with read replicas, this distinction is what lets the driver route reads to a
replica and writes to the primary. It doesn't change behavior against a single CognoDB
instance, but using it correctly is what a reviewer would expect from someone who
understands the driver, not just someone who copy-pasted `tx.run()`.

### Startup connectivity check

```js
export async function verifyConnectivity() {
  await driver.verifyConnectivity();
}
```

Called once in `server.js` at boot, and again on every hit to `GET /health`. This
exists because of a specific failure mode: if you don't verify connectivity, a
misconfigured `.env` (wrong URI, wrong password, instance paused) doesn't fail loudly —
it fails silently until the first real request, and the error the user sees is a
generic 500 with no clue what's wrong. Calling `verifyConnectivity()` at startup turns
that into an immediate, clear log line, and `/health` lets a deploy platform (or you,
debugging) check the same thing at any time without guessing.

---

## 3. Every query, explained

All Cypher lives in `backend/src/services/`, one function per query, all parameterised
(`$paramName` placeholders + a params object passed to `tx.run()` — never string
concatenation, which is what prevents Cypher injection the same way parameterised SQL
prevents SQL injection).

### 3.1 `getAllDevelopers` / `getAllSkills` / `getAllProjects` — 0 hops

```cypher
MATCH (d:Developer) RETURN d ORDER BY d.name
```

The baseline case: no traversal, just "give me every node with this label." This is
the query type a relational table handles just as well — included so the app has
something to compare the multi-hop queries against, and because you need it anyway to
populate dropdowns/lists in the UI.

### 3.2 `getDeveloperProfile` — 1 hop, three separate reads

```cypher
MATCH (d:Developer {id: $id})-[r:HAS_SKILL]->(s:Skill)
RETURN s.name AS name, s.category AS category, r.level AS level
ORDER BY s.name
```

(and the same shape for `WANTS_TO_LEARN` and `WORKED_ON`)

One hop from the developer node to each connected type. **Why three separate queries
instead of one big query with three `OPTIONAL MATCH` clauses?** Because these are
independent, non-overlapping expansions (skills, wants, projects don't relate to each
other) — combining them into one query with a Cartesian-style multi-`OPTIONAL MATCH`
would multiply row counts (if a developer has 5 skills and 3 projects, a single query
returns 15 rows that need de-duplicating client-side). Three simple queries are easier
to read, easier to test independently, and don't have that duplication problem. This
is a deliberate simplicity-over-cleverness choice — a good one to defend if asked.

### 3.3 `findMentorsForSkill` — 3 hops, the mentor-matching query

```cypher
MATCH (me:Developer {id: $devId})-[:WANTS_TO_LEARN]->(target:Skill)
MATCH (me)-[:WORKED_ON]->(proj:Project)<-[:WORKED_ON]-(peer:Developer)-[:HAS_SKILL]->(target)
WHERE peer.id <> $devId
RETURN DISTINCT peer.id AS peerId, peer.name AS peerName, target.name AS skillName,
       proj.name AS sharedProject
ORDER BY target.name, peer.name
```

Read it as English: _"Starting from me, find a skill I want to learn. Separately,
find a project I worked on, find another developer who also worked on that same
project, and check that developer has the skill I want."_

Count the hops in the second `MATCH`: `me → proj` (1), `proj ← peer` (2),
`peer → target` (3). Three relationship traversals, which is exactly the "2+ hop
multi-hop traversal" the assignment explicitly requires. `WHERE peer.id <> $devId`
excludes matching yourself (you always "worked on" your own projects, so without this
filter you'd recommend yourself as your own mentor). `DISTINCT` because if I worked on
two projects with the same peer, the pattern would otherwise match twice.

**This is the single best query to lead with in an interview** — it's the one that
most clearly does something a JOIN-based schema does awkwardly: you'd need to join
`worked_on` to itself (self-join) to find "another developer on the same project," then
join again to `has_skill`, then join again to `wants_to_learn`, all while keeping track
of which alias means "me" vs "peer" at each step.

### 3.4 `findRecommendedPeers` — shared skill, NOT already connected

```cypher
MATCH (me:Developer {id: $devId})-[:HAS_SKILL]->(shared:Skill)<-[:HAS_SKILL]-(peer:Developer)
WHERE peer.id <> $devId
  AND NOT EXISTS {
    MATCH (me)-[:WORKED_ON]->(:Project)<-[:WORKED_ON]-(peer)
  }
RETURN DISTINCT peer.id AS peerId, peer.name AS peerName,
       collect(DISTINCT shared.name) AS sharedSkills
ORDER BY size(sharedSkills) DESC, peer.name
```

Two hops to find the shared skill (`me → shared ← peer`), then a **negative pattern
match** — `NOT EXISTS { ... }` with a nested graph pattern — to exclude anyone I've
already worked with. This is the query worth calling out as "something a relational
database finds awkward": a `NOT EXISTS` over a _graph pattern_ (not a flat column
comparison) is natural in Cypher because the subquery is written in the exact same
pattern-matching language as the rest of the query. In SQL you'd write a correlated
`NOT EXISTS` subquery with an extra self-join inside it — doable, but you're
context-switching between "the shape of the data" and "the shape of the join," where
in Cypher there's only one shape throughout.

`collect(DISTINCT shared.name)` aggregates all shared skill names into a list per
peer, and the final sort ranks by how many skills you have in common.

### 3.5 `findShortestConnectionPath` — the unbounded-depth query

```cypher
MATCH (a:Developer {id: $fromId}), (b:Developer {id: $toId})
MATCH path = shortestPath((a)-[:WORKED_ON|HAS_SKILL*..8]-(b))
RETURN path
```

This is the query the assignment brief means by "a query a relational database would
find awkward." Break down the syntax:

- `[:WORKED_ON|HAS_SKILL*..8]` — traverse either a `WORKED_ON` or a `HAS_SKILL`
  relationship (the `|` is "or"), **any number of times up to 8** (the `*..8`, variable-
  length path syntax). No direction arrow on the relationship (`-[...]-` not
  `-[...]->` ) means it traverses relationships in either direction — you can go
  developer → project → developer → skill → developer, mixing edge types freely.
- `shortestPath(...)` is a built-in Cypher function that runs a breadth-first search
  over that pattern and returns the single shortest path (fewest hops) connecting the
  two anchor nodes, or nothing if they're not connected within the depth bound.
- The 8-hop cap exists for the same reason you'd cap recursion depth anywhere: without
  it, a "not connected at all" query would force a full graph scan before giving up.

**Why this is genuinely hard in SQL:** a relational database has no primitive for
"traverse an unknown number of joins." You'd write a **recursive CTE** — start from
row `a`, recursively join to "anything connected to the current row," track visited
IDs to avoid infinite loops, and manually implement the shortest-path logic (e.g.
breadth-first via an accumulating depth column) yourself, because SQL's recursive CTEs
give you recursion, not graph search. It's possible, but it's an entire hand-rolled
algorithm sitting inside a query, versus one function call in Cypher.

The result is serialized (`serializePath` in `utils/serialize.js`) into
`{ nodes: [...], relationships: [...] }` so the frontend can render it as a literal
chain — this is exactly what the Path Finder screenshot shows: nodes as circles,
relationship types as labels on the connecting lines, and a hop count at the bottom.

### 3.6 `getDeveloperEgoGraph` — the network visualization query

```cypher
MATCH (me:Developer {id: $devId})
OPTIONAL MATCH (me)-[hs:HAS_SKILL]->(skill:Skill)
OPTIONAL MATCH (me)-[wl:WANTS_TO_LEARN]->(wantSkill:Skill)
OPTIONAL MATCH (me)-[wo:WORKED_ON]->(proj:Project)
OPTIONAL MATCH (proj)<-[peerWo:WORKED_ON]-(peer:Developer)
WHERE peer.id <> $devId
RETURN me, hs, skill, wl, wantSkill, wo, proj, peerWo, peer
```

Every clause after the first is `OPTIONAL MATCH` — Cypher's equivalent of a `LEFT
JOIN` — so a developer with zero projects still returns a row instead of vanishing
entirely. The 4th `OPTIONAL MATCH` chains off the 3rd (`proj` from one feeds into the
pattern for the next), extending the traversal one more hop to reach _other_
developers who worked on the same projects — which is what lets the ego-network view
show peers, not just your own skills/projects.

The backend then walks every returned record and de-duplicates nodes/edges into two
`Map`s keyed by Neo4j's internal node/relationship ID (`serializeGraphNode` /
`serializeGraphRelationship`), because the same node can legitimately appear in
multiple rows (e.g. the same project shows up once per peer who worked on it). The
final `{ nodes, edges }` shape is what a force-directed graph UI library — or in this
case, the hand-rolled `NetworkGraph` component — expects.

---

## 4. Backend architecture patterns (be ready to defend these)

### `asyncHandler` — why not just try/catch in every controller

```js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

Every Express controller that awaits a promise needs its rejection caught and routed
to `next(err)`, or an unhandled rejection can crash the process (pre-Express-5) or just
hang the request silently. Writing `try { ... } catch (err) { next(err) }` in every
single controller is repetitive and easy to forget once. `asyncHandler` wraps a
controller once and guarantees that behavior everywhere, so a controller body is just
the happy path — no try/catch noise.

### `ApiError` and `ApiResponse` — a consistent contract

```js
throw new ApiError(404, `No developer found with id "${req.params.id}"`);
```

```js
res.status(200).json(new ApiResponse(200, developers, "Developers fetched"));
```

Before this, routes returned raw JSON directly (`res.json(developers)`), so the
frontend had no consistent way to distinguish "here is your data" from "here is an
error" except by HTTP status code and hoping the shape matched. `ApiError` lets a
controller communicate failure by _throwing_, the same way any other JS error
propagates, and the central error handler is the single place that decides what status
code and JSON shape actually goes over the wire. `ApiResponse` does the same for the
success path — every 2xx response has the same `{ success, data, message }` shape, so
the frontend's axios interceptor can unwrap `.data` generically instead of each page
knowing the specific shape of each endpoint.

### Selective imports (`import { x, y } from "..."` instead of `import * as service`)

Every controller imports only the specific service functions it calls, and aliases
anything that would otherwise collide with the controller's own exported name (e.g.
`import { getDeveloperProfile as fetchDeveloperProfile }`). This is a small thing, but
it makes the controller's imports double as documentation of exactly what it depends
on, and it's the more common convention in production codebases than importing an
entire module as a namespace object.

## 5. Frontend architecture patterns

### Axios instance + interceptors instead of `fetch` per call

```js
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "...",
});

instance.interceptors.response.use(
  (res) => res.data?.data, // unwrap { success, data, message } -> data
  (err) => Promise.reject(new Error(err.response?.data?.message || "...")),
);
```

One axios instance is created once and reused everywhere `api.*` is called. The
response interceptor means every single call site in the app — every page — gets back
the _actual payload_ directly (an array, an object), never the response envelope, and
every failure arrives as a plain `Error` with a human-readable `.message`. This is what
lets every page's existing `.then(setData).catch((err) => setError(err.message))`
pattern keep working without each page needing to know the backend wraps responses.

### Tailwind CSS v4

This project was migrated from Tailwind v3 (`tailwind.config.js` + PostCSS) to v4
(`@tailwindcss/vite` plugin + a CSS-native `@theme` block). The practical difference
worth knowing: in v3, design tokens (custom colors, fonts, border radii) lived in a JS
config object under `theme.extend`; in v4, the same tokens are declared as CSS custom
properties inside an `@theme { }` block directly in the stylesheet, and Tailwind reads
them from there. Functionally equivalent — same generated utility classes
(`bg-circuit`, `font-mono`, `rounded-panel`, etc.) — but no build-time JS config file
to keep in sync with the CSS, and the values are just plain CSS variables that could
be inspected in devtools if needed.

---

## 6. Likely interview questions and how to answer them

**Q: Why did you pick this use case instead of something more common like a social
network or an org chart?**
A developer/skill/project graph has three distinct entity types with genuinely
different relationship semantics (has, wants, worked-on, uses) rather than one
homogeneous "follows" edge, so it gives more interesting query variety — multi-hop
mentor matching, a negative-pattern recommendation query, and an unbounded shortest
path — in a small, easy-to-verify dataset.

**Q: What would break first if this dataset grew to a million developers?**
The `shortestPath` query's 8-hop cap would matter more (worst-case BFS cost grows with
branching factor), and the ego-network query's `OPTIONAL MATCH` chain could return a
lot of rows for a highly-connected node — that's the point where you'd add `LIMIT`
clauses or move to precomputed/cached recommendations instead of computing them live
on every request.

**Q: Why sessions per request instead of one long-lived session?**
Sessions are stateful and not meant to be shared across concurrent operations — Neo4j
explicitly documents this. The driver already pools the expensive resource
(connections); sessions are the cheap, short-lived unit of work borrowed from that
pool, so one per request is both correct and idiomatic.

**Q: How do you prevent Cypher injection?**
Every query uses parameters (`$id`, `$devId`, etc.) passed as a separate object to
`tx.run(cypher, params)`, never string interpolation into the Cypher text. The driver
sends the query text and parameters separately over Bolt, so user input is never part
of the parsed query structure — same principle as parameterised SQL.

**Q: What's the difference between `MATCH` and `OPTIONAL MATCH`?**
`MATCH` requires the pattern to exist — if it doesn't, that row (or the whole query, if
it's the first clause) produces no result. `OPTIONAL MATCH` is Cypher's `LEFT JOIN`
equivalent — the preceding rows are kept with `null` bound to anything the optional
pattern couldn't match, instead of being dropped.

**Q: Why `executeRead`/`executeWrite` instead of just `session.run()`?**
`executeRead`/`executeWrite` wrap the query in a **managed transaction** with
automatic retry on transient errors (e.g. a leader election in a clustered deployment),
and they let the driver route the query to the correct cluster member in a
multi-instance setup. `session.run()` outside a managed transaction doesn't get that
retry behavior for free.

**Q: Walk me through what happens end to end when the Path Finder page loads.**
The page calls `api.getShortestPath(fromId, toId)` → axios GET
`/api/graph/path?from=...&to=...` → `graphController.getShortestPath` (wrapped in
`asyncHandler`) validates both query params are present, calls
`graphService.findShortestConnectionPath` → opens a session, runs the parameterised
`shortestPath()` Cypher, serializes the path into `{ nodes, relationships }`, closes
the session → controller wraps it in `ApiResponse` → axios interceptor unwraps `.data`
→ the page renders each node with a `TraceLine` between them labeled with the
relationship type.

**Q: Why is the error handling split between an `ApiError` class and a central
middleware, instead of just writing `res.status(...).json(...)` in each controller?**
So the _decision_ of what status/message to send lives in exactly one place (the
middleware) regardless of _where_ the error originated — a controller throwing
`ApiError(404, ...)`, an unexpected Neo4j `ServiceUnavailable`, or a genuinely
unexpected bug all funnel through the same middleware and come out as a consistent
JSON shape, instead of every controller needing to remember the right shape by hand.

**Q: What's your Node/Express/MERN background, and how does this project reflect it?**
_(Answer this one in your own words based on your own experience — the honest version
of this answer matters more than a scripted one, since this is exactly the kind of
question where a canned answer is easy to spot.)_
