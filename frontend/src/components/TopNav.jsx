import { NavLink } from "react-router-dom";
import { GitBranch } from "lucide-react";

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-panel transition-colors ${
    isActive
      ? "bg-circuit-dim text-circuit"
      : "text-ink/70 hover:text-ink hover:bg-black/5"
  }`;

export default function TopNav() {
  return (
    <header className="sticky top-0 z-10 bg-paper/95 backdrop-blur">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-circuit text-white">
            <GitBranch size={15} strokeWidth={2.5} />
          </span>
          <span className="font-semibold tracking-tight">Dev Mentor Graph</span>
        </div>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Explore
          </NavLink>
          <NavLink to="/path" className={linkClass}>
            Path Finder
          </NavLink>
          <NavLink to="/how-it-works" className={linkClass}>
            How it works
          </NavLink>
        </nav>
      </div>
      <div className="relative h-px bg-line">
        <span className="absolute left-6 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-circuit" />
      </div>
    </header>
  );
}
