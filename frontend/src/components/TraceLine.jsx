export default function TraceLine({ label, animated = false }) {
  return (
    <div className={`trace-line flex-1 ${animated ? 'trace-line--animated' : ''}`}>
      {label && <span className="trace-label">{label}</span>}
    </div>
  );
}
