import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingState, ErrorState } from "./StateViews.jsx";

const SVG_W = 720;
const SVG_H = 520;
const CX = SVG_W / 2;
const CY = SVG_H / 2;
const R_INNER = 130;
const R_OUTER = 230;

const COLORS = {
  Developer: "#2F6FED",
  Skill: "#1C9D6C",
  Project: "#DE9A34",
};

function polar(cx, cy, r, angleRad) {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function nodeType(node) {
  if (node.labels?.includes("Developer")) return "Developer";
  if (node.labels?.includes("Skill")) return "Skill";
  if (node.labels?.includes("Project")) return "Project";
  return "Developer";
}

function nodeLabel(node) {
  return node.name || node.title || "Unknown";
}

function nodeLink(node) {
  const type = nodeType(node);
  if (type === "Developer") return `/developers/${node.id}`;
  if (type === "Skill") return `/skills/${encodeURIComponent(node.name)}`;
  if (type === "Project") return `/projects/${node.id}`;
  return "#";
}

export default function NetworkGraph({ centerId, data, status, error }) {
  const navigate = useNavigate();

  const layout = useMemo(() => {
    if (!data || !data.nodes || !data.edges) return null;

    const centerNode = data.nodes.find(
      (n) => n.id === centerId && nodeType(n) === "Developer",
    );
    if (!centerNode) return null;

    const skills = data.nodes.filter((n) => nodeType(n) === "Skill");
    const projects = data.nodes.filter((n) => nodeType(n) === "Project");
    const peers = data.nodes.filter(
      (n) => nodeType(n) === "Developer" && n.id !== centerId,
    );

    const inner = [...skills, ...projects];
    const outer = peers;

    const placed = new Map();
    placed.set(centerNode._id, { ...centerNode, x: CX, y: CY, r: 22 });

    inner.forEach((n, i) => {
      const angle = (i / Math.max(inner.length, 1)) * 2 * Math.PI - Math.PI / 2;
      const pos = polar(CX, CY, R_INNER, angle);
      placed.set(n._id, { ...n, x: pos.x, y: pos.y, r: 16 });
    });

    outer.forEach((n, i) => {
      const angle = (i / Math.max(outer.length, 1)) * 2 * Math.PI - Math.PI / 2;
      const pos = polar(CX, CY, R_OUTER, angle);
      placed.set(n._id, { ...n, x: pos.x, y: pos.y, r: 18 });
    });

    const edges = data.edges
      .map((e) => {
        const s = placed.get(e.source);
        const t = placed.get(e.target);
        if (!s || !t) return null;
        return {
          ...e,
          x1: s.x,
          y1: s.y,
          x2: t.x,
          y2: t.y,
          mx: (s.x + t.x) / 2,
          my: (s.y + t.y) / 2,
        };
      })
      .filter(Boolean);

    return { nodes: [...placed.values()], edges };
  }, [data, centerId]);

  if (status === "loading") {
    return (
      <div className="flex h-80 items-center justify-center">
        <LoadingState label="Building graph…" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-80 items-center justify-center">
        <ErrorState message={error} />
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="flex h-80 items-center justify-center">
        <p className="text-sm text-ink/50">No graph data available.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="mx-auto block"
        style={{ maxWidth: "100%", height: "auto" }}
      >
        <g>
          {layout.edges.map((e) => (
            <g key={e.id}>
              <line
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke="#C9D2DC"
                strokeWidth={1}
              />
              <rect
                x={e.mx - 4}
                y={e.my - 9}
                width={(e.type?.length || 0) * 6.5 + 8}
                height={16}
                rx={3}
                fill="#EDF1F5"
              />
              <text
                x={e.mx}
                y={e.my + 3}
                textAnchor="middle"
                fontFamily="'IBM Plex Mono', ui-monospace, monospace"
                fontSize={10}
                fill="#2F6FED"
                letterSpacing="0.04em"
              >
                {e.type}
              </text>
            </g>
          ))}
        </g>

        <g>
          {layout.nodes.map((n) => {
            const type = nodeType(n);
            const color = COLORS[type];
            const isCenter = n.id === centerId;
            return (
              <g
                key={n._id}
                transform={`translate(${n.x}, ${n.y})`}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(nodeLink(n))}
              >
                <circle
                  r={n.r}
                  fill={color}
                  opacity={isCenter ? 1 : 0.9}
                  stroke="#fff"
                  strokeWidth={2}
                />
                <text
                  y={n.r + 14}
                  textAnchor="middle"
                  fontFamily="'IBM Plex Sans', system-ui, sans-serif"
                  fontSize={11}
                  fontWeight={500}
                  fill="#16233A"
                  pointerEvents="none"
                >
                  {nodeLabel(n)}
                </text>
                {isCenter && (
                  <text
                    y={-n.r - 6}
                    textAnchor="middle"
                    fontFamily="'IBM Plex Mono', ui-monospace, monospace"
                    fontSize={9}
                    fill="#2F6FED"
                    letterSpacing="0.06em"
                    pointerEvents="none"
                  >
                    DEVELOPER
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
