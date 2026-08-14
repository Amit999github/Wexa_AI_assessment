import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../api/client.js';
import DeveloperCard from '../components/DeveloperCard.jsx';
import { LoadingState, EmptyState, ErrorState } from '../components/StateViews.jsx';

export default function ExplorePage() {
  const [developers, setDevelopers] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const load = () => {
    setError(null);
    setDevelopers(null);
    api
      .getDevelopers()
      .then(setDevelopers)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!developers) return [];
    const q = query.trim().toLowerCase();
    if (!q) return developers;
    return developers.filter((d) => d.name.toLowerCase().includes(q) || d.bio?.toLowerCase().includes(q));
  }, [developers, query]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Explore developers</h1>
        <p className="mt-1 text-sm text-ink/55">
          Every person here is a node. Skills, projects, and mentors are the edges — open a profile to trace them.
        </p>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or bio…"
          className="w-full rounded-panel border border-line bg-white py-2 pl-9 pr-3 text-sm placeholder:text-ink/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-circuit"
        />
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && !developers && <LoadingState label="Loading developers…" />}
      {!error && developers && filtered.length === 0 && (
        <EmptyState title="No developers match that search" hint="Try a different name or clear the search." />
      )}
      {!error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((d) => (
            <DeveloperCard key={d.id} developer={d} />
          ))}
        </div>
      )}
    </div>
  );
}
