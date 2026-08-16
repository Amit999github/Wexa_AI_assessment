export default function Panel({ eyebrow, title, action, children }) {
  return (
    <section className="rounded-panel border border-line bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          {eyebrow && (
            <p className="font-mono text-[11px] uppercase tracking-wider text-circuit mb-1">
              {eyebrow}
            </p>
          )}
          {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
