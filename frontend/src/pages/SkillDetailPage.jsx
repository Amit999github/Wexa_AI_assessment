import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Folder } from "lucide-react";
import { api } from "../api/client.js";
import Avatar from "../components/Avatar.jsx";
import Panel from "../components/Panel.jsx";
import SkillChip from "../components/SkillChip.jsx";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "../components/StateViews.jsx";

function useAsync(fn, deps) {
  const [state, setState] = useState({
    status: "loading",
    data: null,
    error: null,
  });
  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", data: null, error: null });
    fn()
      .then(
        (data) =>
          !cancelled && setState({ status: "ready", data, error: null }),
      )
      .catch(
        (error) =>
          !cancelled &&
          setState({ status: "error", data: null, error: error.message }),
      );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export default function SkillDetailPage() {
  const { name } = useParams();
  const skill = useAsync(() => api.getSkillDetail(name), [name]);

  if (skill.status === "loading") {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <LoadingState label="Loading skill…" />
      </div>
    );
  }

  if (skill.status === "error") {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <ErrorState message={skill.error} />
      </div>
    );
  }

  const s = skill.data;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink/55 hover:text-circuit"
      >
        <ArrowLeft size={14} /> Back to Explore
      </Link>

      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <SkillChip name={s.name} category={s.category} />
        </div>
        <p className="text-sm text-ink/60">
          Category: <span className="font-medium text-ink">{s.category}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Panel eyebrow="HAS_SKILL" title="Developers with this skill">
          {s.developers.length === 0 ? (
            <EmptyState
              title="No developers found"
              hint="No one in the network has recorded this skill yet."
            />
          ) : (
            <ul className="space-y-3">
              {s.developers.map((d) => (
                <li key={d.id} className="flex items-center gap-3">
                  <Avatar name={d.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/developers/${d.id}`}
                      className="truncate text-sm font-medium text-ink hover:text-circuit hover:underline"
                    >
                      {d.name}
                    </Link>
                  </div>
                  <span className="font-mono text-[11px] uppercase text-signal">
                    {d.level}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel eyebrow="USES_SKILL" title="Projects using this skill">
          {s.projects.length === 0 ? (
            <EmptyState
              title="No projects found"
              hint="No project in the network uses this skill yet."
            />
          ) : (
            <ul className="space-y-3">
              {s.projects.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <Folder size={18} className="shrink-0 text-amber" />
                  <Link
                    to={`/projects/${p.id}`}
                    className="text-sm font-medium text-ink hover:text-circuit hover:underline"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
