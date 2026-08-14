import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeftRight } from 'lucide-react';
import { api } from '../api/client.js';
import Avatar from '../components/Avatar.jsx';
import TraceLine from '../components/TraceLine.jsx';
import { LoadingState, EmptyState, ErrorState } from '../components/StateViews.jsx';

function PathNode({ node }) {
  if (node.labels.includes('Developer')) {
    return (
      <div className="flex flex-col items-center gap-1.5 text-center w-24">
        <Avatar name={node.name} size={44} />
        <span className="text-xs font-medium leading-tight">{node.name}</span>
      </div>
    );
  }
  if (node.labels.includes('Skill')) {
    return (
      <div className="flex flex-col items-center gap-1.5 text-center w-24">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-signal-dim text-signal font-mono text-[10px] font-semibold px-1">
          SKILL
        </div>
        <span className="text-xs font-medium leading-tight">{node.name}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1.5 text-center w-24">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-dim text-amber font-mono text-[10px] font-semibold px-1">
        PROJ
      </div>
      <span className="text-xs font-medium leading-tight">{node.name}</span>
    </div>
  );
}

export default function PathFinderPage() {
  const [params, setParams] = useSearchParams();
  const [developers, setDevelopers] = useState(null);
  const [from, setFrom] = useState(params.get('from') || '');
  const [to, setTo] = useState(params.get('to') || '');
  const [path, setPath] = useState({ status: 'idle', data: null, error: null });

  useEffect(() => {
    api.getDevelopers().then(setDevelopers).catch(() => setDevelopers([]));
  }, []);

  const findPath = (e) => {
    e?.preventDefault();
    if (!from || !to) return;
    setParams({ from, to });
    setPath({ status: 'loading', data: null, error: null });
    api
      .getShortestPath(from, to)
      .then((data) => setPath({ status: 'ready', data, error: null }))
      .catch((err) => setPath({ status: 'error', data: null, error: err.message }));
  };

  // Auto-run if both params arrived pre-filled (e.g. from a profile page link
  // once a "to" is also picked below).
  useEffect(() => {
    if (params.get('from') && params.get('to')) findPath();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Path finder</h1>
        <p className="mt-1 text-sm text-ink/55">
          Shortest connection between any two developers, traced through shared projects and skills.
        </p>
      </div>

      <form onSubmit={findPath} className="mb-8 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink/55" htmlFor="from-select">
            From
          </label>
          <select
            id="from-select"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-panel border border-line bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-circuit"
          >
            <option value="">Select developer…</option>
            {developers?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <ArrowLeftRight size={16} className="mb-2.5 text-ink/30" />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink/55" htmlFor="to-select">
            To
          </label>
          <select
            id="to-select"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-panel border border-line bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-circuit"
          >
            <option value="">Select developer…</option>
            {developers?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!from || !to || from === to}
          className="rounded-panel bg-circuit px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-circuit focus-visible:ring-offset-2"
        >
          Trace path
        </button>
      </form>

      {from && to && from === to && (
        <EmptyState title="Pick two different developers" hint="A path needs two distinct endpoints." />
      )}

      {path.status === 'loading' && <LoadingState label="Searching the graph…" />}
      {path.status === 'error' && <ErrorState message={path.error} onRetry={findPath} />}
      {path.status === 'ready' && path.data.nodes.length === 0 && (
        <EmptyState title="No connection found" hint="These two developers aren't connected in the graph yet." />
      )}

      {path.status === 'ready' && path.data.nodes.length > 0 && (
        <div className="rounded-panel border border-line bg-white p-8 overflow-x-auto">
          <div className="flex items-center min-w-max">
            {path.data.nodes.map((node, i) => (
              <div key={node.id} className="flex items-center">
                <PathNode node={node} />
                {i < path.data.relationships.length && (
                  <div className="w-16 flex items-center px-1">
                    <TraceLine label={path.data.relationships[i].type} animated />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="mt-6 text-center font-mono text-[11px] text-ink/40">
            {path.data.relationships.length} hop{path.data.relationships.length === 1 ? '' : 's'}
          </p>
        </div>
      )}
    </div>
  );
}
