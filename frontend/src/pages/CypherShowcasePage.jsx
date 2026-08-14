import { GitBranch, Route, Users } from "lucide-react";
import Panel from "../components/Panel.jsx";

function CypherBlock({ children }) {
  return (
    <pre className="overflow-x-auto rounded-panel bg-ink p-4 text-xs leading-relaxed text-white/90">
      <code>{children}</code>
    </pre>
  );
}

function Keyword({ children }) {
  return <span className="text-circuit-dim">{children}</span>;
}
function Var({ children }) {
  return <span className="text-white/70">{children}</span>;
}
function Str({ children }) {
  return <span className="text-white/50">{children}</span>;
}

export default function CypherShowcasePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          How this works
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          The three graph queries that power this app — written in openCypher,
          explained in plain English.
        </p>
      </div>

      <div className="space-y-6">
        <Panel
          eyebrow="3-hop traversal"
          title="Mentor matching"
          action={<Users size={16} className="text-ink/30" />}
        >
          <p className="mb-4 text-sm leading-relaxed text-ink/70">
            Find people you have already worked with on a project who happen to
            have a skill you want to learn. This is a{" "}
            <strong>three-hop traversal</strong> across{" "}
            <code className="rounded bg-paper px-1 py-0.5 font-mono text-[11px] text-ink/70">
              WANTS_TO_LEARN
            </code>
            ,{" "}
            <code className="rounded bg-paper px-1 py-0.5 font-mono text-[11px] text-ink/70">
              WORKED_ON
            </code>
            , and{" "}
            <code className="rounded bg-paper px-1 py-0.5 font-mono text-[11px] text-ink/70">
              HAS_SKILL
            </code>
            . In SQL this would need multiple self-joins and still return a much
            less natural shape.
          </p>
          <CypherBlock>
            <Keyword>MATCH</Keyword>{" "}
            <Var>
              (me:Developer {"{"}id: $devId{"}"})
            </Var>
            <Keyword>-[:WANTS_TO_LEARN]-&gt;</Keyword>
            <Var>(target:Skill)</Var>
            {"\n"}
            <Keyword>MATCH</Keyword> <Var>(me)</Var>
            <Keyword>-[:WORKED_ON]-&gt;</Keyword>
            <Var>(proj:Project)</Var>
            <Keyword>&lt;-[:WORKED_ON]-</Keyword>
            <Var>(peer:Developer)</Var>
            <Keyword>-[:HAS_SKILL]-&gt;</Keyword>
            <Var>(target)</Var>
            {"\n"}
            <Keyword>WHERE</Keyword> <Var>peer.id</Var>{" "}
            <Keyword>&lt;&gt;</Keyword> <Str>$devId</Str>
            {"\n"}
            <Keyword>RETURN DISTINCT</Keyword> <Var>peer.id</Var>{" "}
            <Keyword>AS</Keyword> <Var>peerId</Var>, <Var>peer.name</Var>{" "}
            <Keyword>AS</Keyword> <Var>peerName</Var>,{"\n"}
            {"  "}
            <Var>target.name</Var> <Keyword>AS</Keyword> <Var>skillName</Var>,{" "}
            <Var>proj.name</Var> <Keyword>AS</Keyword> <Var>sharedProject</Var>
            {"\n"}
            <Keyword>ORDER BY</Keyword> <Var>target.name</Var>,{" "}
            <Var>peer.name</Var>
          </CypherBlock>
        </Panel>

        <Panel
          eyebrow="NOT EXISTS subquery"
          title="Peer recommendations"
          action={<GitBranch size={16} className="text-ink/30" />}
        >
          <p className="mb-4 text-sm leading-relaxed text-ink/70">
            Surface developers who share a skill with you but have{" "}
            <strong>never worked on a project together</strong>. The{" "}
            <code className="rounded bg-paper px-1 py-0.5 font-mono text-[11px] text-ink/70">
              NOT EXISTS
            </code>{" "}
            subquery over a graph pattern is the key — it filters out anyone
            already one project-hop away. This is awkward in relational
            databases because it requires an anti-join or correlated subquery
            across multiple many-to-many tables.
          </p>
          <CypherBlock>
            <Keyword>MATCH</Keyword>{" "}
            <Var>
              (me:Developer {"{"}id: $devId{"}"})
            </Var>
            <Keyword>-[:HAS_SKILL]-&gt;</Keyword>
            <Var>(shared:Skill)</Var>
            <Keyword>&lt;-[:HAS_SKILL]-</Keyword>
            <Var>(peer:Developer)</Var>
            {"\n"}
            <Keyword>WHERE</Keyword> <Var>peer.id</Var>{" "}
            <Keyword>&lt;&gt;</Keyword> <Str>$devId</Str>
            {"\n"}
            {"  "}
            <Keyword>AND NOT EXISTS</Keyword> {"{"}
            {"\n"}
            {"    "}
            <Keyword>MATCH</Keyword> <Var>(me)</Var>
            <Keyword>-[:WORKED_ON]-&gt;</Keyword>
            <Var>(:Project)</Var>
            <Keyword>&lt;-[:WORKED_ON]-</Keyword>
            <Var>(peer)</Var>
            {"\n"}
            {"  }"}
            {"\n"}
            <Keyword>RETURN DISTINCT</Keyword> <Var>peer.id</Var>{" "}
            <Keyword>AS</Keyword> <Var>peerId</Var>, <Var>peer.name</Var>{" "}
            <Keyword>AS</Keyword> <Var>peerName</Var>,{"\n"}
            {"  "}
            <Keyword>collect</Keyword>(<Keyword>DISTINCT</Keyword>{" "}
            <Var>shared.name</Var>) <Keyword>AS</Keyword>{" "}
            <Var>sharedSkills</Var>
            {"\n"}
            <Keyword>ORDER BY</Keyword> <Keyword>size</Keyword>(
            <Var>sharedSkills</Var>) <Keyword>DESC</Keyword>,{" "}
            <Var>peer.name</Var>
          </CypherBlock>
        </Panel>

        <Panel
          eyebrow="variable-length path"
          title="Shortest connection path"
          action={<Route size={16} className="text-ink/30" />}
        >
          <p className="mb-4 text-sm leading-relaxed text-ink/70">
            Find the shortest chain of connections between any two developers,
            traversing either{" "}
            <code className="rounded bg-paper px-1 py-0.5 font-mono text-[11px] text-ink/70">
              WORKED_ON
            </code>{" "}
            or{" "}
            <code className="rounded bg-paper px-1 py-0.5 font-mono text-[11px] text-ink/70">
              HAS_SKILL
            </code>{" "}
            edges. The{" "}
            <code className="rounded bg-paper px-1 py-0.5 font-mono text-[11px] text-ink/70">
              *..8
            </code>{" "}
            syntax means "up to 8 hops". A relational database would need a
            recursive CTE and still struggle with the variable relationship-type
            union.
          </p>
          <CypherBlock>
            <Keyword>MATCH</Keyword>{" "}
            <Var>
              (a:Developer {"{"}id: $fromId{"}"})
            </Var>
            ,{" "}
            <Var>
              (b:Developer {"{"}id: $toId{"}"})
            </Var>
            {"\n"}
            <Keyword>MATCH</Keyword> <Var>path</Var> <Keyword>=</Keyword>{" "}
            <Keyword>shortestPath</Keyword>(<Var>(a)</Var>
            <Keyword>-[:WORKED_ON|HAS_SKILL*..8]-</Keyword>
            <Var>(b)</Var>){"\n"}
            <Keyword>RETURN</Keyword> <Var>path</Var>
          </CypherBlock>
        </Panel>
      </div>
    </div>
  );
}
