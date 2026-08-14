import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { api } from '../api/client.js';
import Avatar from '../components/Avatar.jsx';
import SkillChip from '../components/SkillChip.jsx';
import Panel from '../components/Panel.jsx';
import TraceLine from '../components/TraceLine.jsx';
import { LoadingState, EmptyState, ErrorState } from '../components/StateViews.jsx';

function useAsync(fn, deps) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', data: null, error: null });
    fn()
      .then((data) => !cancelled && setState({ status: 'ready', data, error: null }))
      .catch((error) => !cancelled && setState({ status: 'error', data: null, error: error.message }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export default function DeveloperProfilePage() {
  const { id } = useParams();
  const profile = useAsync(() => api.getDeveloperProfile(id), [id]);
  const mentors = useAsync(() => api.getMentors(id), [id]);
  const recommendations = useAsync(() => api.getRecommendations(id), [id]);

  if (profile.status === 'loading') {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <LoadingState label="Loading profile…" />
      </div>
    );
  }

  if (profile.status === 'error') {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <ErrorState message={profile.error} />
      </div>
    );
  }

  const dev = profile.data;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink/55 hover:text-circuit">
        <ArrowLeft size={14} /> Back to Explore
      </Link>

      <div className="mb-8 flex items-start gap-4">
        <Avatar name={dev.name} size={56} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{dev.name}</h1>
          <p className="mt-1 max-w-xl text-sm text-ink/60">{dev.bio}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Panel eyebrow="HAS_SKILL" title="Skills">
          {dev.skills.length === 0 ? (
            <EmptyState title="No skills recorded yet" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {dev.skills.map((s) => (
                <SkillChip key={s.name} name={s.name} level={s.level} />
              ))}
            </div>
          )}
        </Panel>

        <Panel eyebrow="WANTS_TO_LEARN" title="Learning goals">
          {dev.wantsToLearn.length === 0 ? (
            <EmptyState title="No learning goals set" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {dev.wantsToLearn.map((s) => (
                <SkillChip key={s.name} name={s.name} category={s.category} />
              ))}
            </div>
          )}
        </Panel>

        <Panel eyebrow="WORKED_ON" title="Projects" action={undefined}>
          {dev.projects.length === 0 ? (
            <EmptyState title="No projects recorded yet" />
          ) : (
            <ul className="space-y-2">
              {dev.projects.map((p) => (
                <li key={p.id} className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-ink">{p.name}</span>
                  <span className="font-mono text-[11px] text-ink/45">{p.role}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          eyebrow="3-hop traversal"
          title="Mentors for your learning goals"
        >
          {mentors.status === 'loading' && <LoadingState label="Tracing paths…" />}
          {mentors.status === 'error' && <ErrorState message={mentors.error} />}
          {mentors.status === 'ready' && mentors.data.length === 0 && (
            <EmptyState
              title="No mentor path found yet"
              hint="No one you've worked with directly has a skill you want to learn."
            />
          )}
          {mentors.status === 'ready' && mentors.data.length > 0 && (
            <ul className="space-y-3">
              {mentors.data.map((m, i) => (
                <li key={`${m.peerId}-${m.skillName}-${i}`} className="flex items-center gap-3">
                  <Avatar name={m.peerName} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{m.peerName}</p>
                    <p className="truncate text-[11px] text-ink/45">via {m.sharedProject}</p>
                  </div>
                  <TraceLine label={m.skillName} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-5">
        <Panel eyebrow="Shared HAS_SKILL, no WORKED_ON" title="People you should meet">
          {recommendations.status === 'loading' && <LoadingState label="Scanning the graph…" />}
          {recommendations.status === 'error' && <ErrorState message={recommendations.error} />}
          {recommendations.status === 'ready' && recommendations.data.length === 0 && (
            <EmptyState
              title="No new connections surfaced"
              hint="Everyone who shares a skill with you has already worked with you."
            />
          )}
          {recommendations.status === 'ready' && recommendations.data.length > 0 && (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recommendations.data.map((r) => (
                <li key={r.peerId} className="flex items-center gap-3 rounded-panel border border-line p-3">
                  <Avatar name={r.peerName} size={32} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{r.peerName}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.sharedSkills.map((s) => (
                        <span key={s} className="font-mono text-[10px] uppercase text-signal">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Link
        to={`/path?from=${dev.id}`}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-circuit hover:underline"
      >
        <Compass size={14} /> Find their shortest path to someone else
      </Link>
    </div>
  );
}
