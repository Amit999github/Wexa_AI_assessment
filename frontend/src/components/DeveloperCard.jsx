import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';

export default function DeveloperCard({ developer }) {
  return (
    <Link
      to={`/developers/${developer.id}`}
      className="group flex items-start gap-3 rounded-panel border border-line bg-white p-4 transition-shadow hover:shadow-sm focus-visible:outline-none"
    >
      <Avatar name={developer.name} size={40} />
      <div className="min-w-0">
        <p className="font-medium text-ink group-hover:text-circuit">{developer.name}</p>
        <p className="mt-0.5 text-xs text-ink/55 line-clamp-2">{developer.bio}</p>
      </div>
    </Link>
  );
}
