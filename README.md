# Dev Mentor Graph — CognoDB take-home (Wexa AI)

Status: **backend confirmed working against a live CognoDB instance; frontend built and build-tested.**
This README will be expanded with the full "Why a graph database?" writeup,
data model diagram, and UI screenshots before submission.

## Use case

A developer skill & mentor-matching app. Developers, skills, and projects
form a graph — the interesting question isn't "list developers" (a table
handles that fine), it's "who can help me learn X, given who I already
know" — a connections question a relational join chain answers awkwardly
and a graph traversal answers naturally.

## Data model

- `(Developer)-[:HAS_SKILL {level}]->(Skill)`
- `(Developer)-[:WANTS_TO_LEARN]->(Skill)`
- `(Developer)-[:WORKED_ON {role}]->(Project)`
- `(Project)-[:USES_SKILL]->(Skill)`

## Backend setup (done)

```bash
cd backend
npm install
cp .env.example .env      # fill in your CognoDB URI + password from console.cognodb.com
npm run seed               # loads the sample dataset (10 devs, 18 skills, 6 projects)
npm run dev                 # starts the API on http://localhost:5000
```

Verified so far (against a dummy connection string, since I don't have your
CognoDB credentials):
- Server boots even when the database is unreachable, and `/health` reports
  it clearly instead of the process crashing.
- Every API route fails gracefully with a `503` and a clear message when the
  database is down, instead of a raw stack trace.
- All backend source files pass `node --check` and the dependency graph
  resolves cleanly (`npm install` succeeds, 108 packages).

**Not yet verified against a real CognoDB instance** — that needs your
actual `BOLT_URI` / password, which I don't have. Once you provision your
free instance, run `npm run seed` and then hit the endpoints below to
confirm the queries return what's expected.

### API endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | DB connectivity check |
| GET | `/api/developers` | list all developers |
| GET | `/api/developers/:id` | full profile (skills, wants, projects) |
| GET | `/api/developers/:id/graph` | ego-network for visualization |
| GET | `/api/developers/:id/mentors` | **multi-hop**: mentors for skills they want to learn |
| GET | `/api/developers/:id/recommendations` | peers who share a skill but haven't collaborated |
| GET | `/api/graph/path?from=X&to=Y` | **shortest path** between two developers |
| GET | `/api/skills` | list all skills |
| GET | `/api/skills/:name/developers` | who has a given skill |
| GET | `/api/projects` | list all projects |
| GET | `/api/projects/:id/team` | who worked on a project |

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env      # point VITE_API_BASE_URL at your running backend
npm run dev                 # http://localhost:5173
```

Three pages:
- **Explore** (`/`) — directory of all developers, searchable by name/bio.
- **Developer profile** (`/developers/:id`) — skills, learning goals,
  projects, and the two graph-query panels: mentors (3-hop traversal) and
  recommended peers (shared skill, no shared project).
- **Path finder** (`/path`) — pick any two developers, runs the
  `shortestPath()` query, renders the connection as a traced chain of
  nodes and relationship-typed edges.

Verified: `npm install` (134 packages) and `npm run build` both succeed
cleanly, and the production build serves correctly under `npm run preview`.
**Not yet checked in a real browser against live data** — do that next by
running both servers together and clicking through all three pages.

## Next steps

1. Click through the running app end-to-end against your real CognoDB data;
   confirm mentor matches, recommendations, and at least one interesting
   shortest-path result (try `dev6` → `dev8`, which should show a 4-hop path
   through two shared projects).
2. Fill in the rest of this README: data model diagram image, screenshots,
   query walkthroughs.
3. Deploy backend (Render) + frontend (Vercel), record the screen capture.
