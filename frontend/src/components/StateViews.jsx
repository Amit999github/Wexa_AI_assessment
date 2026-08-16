import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="flex items-center gap-2 py-8 justify-center text-ink/50 text-sm">
      <Loader2 size={16} className="animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <Inbox size={20} className="text-ink/30" />
      <p className="text-sm font-medium text-ink/70">{title}</p>
      {hint && <p className="text-xs text-ink/45 max-w-xs">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <AlertTriangle size={20} className="text-danger" />
      <p className="text-sm font-medium text-danger">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 text-xs font-medium text-circuit hover:underline focus-visible:outline-none"
        >
          Try again
        </button>
      )}
    </div>
  );
}
