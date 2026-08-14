import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

export default function ProjectDetailPage() {
  const { id } = useParams();
  const project = useAsync(() => api.getProjectDetail(id), [id]);

  if (project.status === "loading") {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <LoadingState label="Loading project…" />
      </div>
    );
  }

  if (project.status === "error") {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <ErrorState message={project.error} />
      </div>
    );
  }

  const p = project.data;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink/55 hover:text-circuit"
      >
        <ArrowLeft size={14} /> Back to Explore
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {p.name}
        </h1>
        {p.description && (
          <p className="mt-2 max-w-xl text-sm text-ink/60">{p.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Panel eyebrow="WORKED_ON" title="Team members">
          {p.team.length === 0 ? (
            <EmptyState
              title="No team members found"
              hint="No developers are linked to this project yet."
            />
          ) : (
            <ul className="space-y-3">
              {p.team.map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <Avatar name={m.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/developers/${m.id}`}
                      className="truncate text-sm font-medium text-ink hover:text-circuit hover:underline"
                    >
                      {m.name}
                    </Link>
                  </div>
                  <span className="font-mono text-[11px] uppercase text-ink/45">
                    {m.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel eyebrow="USES_SKILL" title="Technologies used">
          {p.skills.length === 0 ? (
            <EmptyState
              title="No skills recorded"
              hint="This project has not been linked to any skills yet."
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {p.skills.map((s) => (
                <SkillChip key={s.name} name={s.name} category={s.category} />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
