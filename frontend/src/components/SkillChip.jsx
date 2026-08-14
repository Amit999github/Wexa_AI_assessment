const LEVEL_DOTS = { beginner: 1, intermediate: 2, advanced: 3 };

export default function SkillChip({ name, level, category }) {
  const dots = LEVEL_DOTS[level] || 0;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink/80">
      {name}
      {level && (
        <span className="flex items-center gap-0.5" title={level} aria-label={`level: ${level}`}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: i < dots ? '#1C9D6C' : '#C9D2DC' }}
            />
          ))}
        </span>
      )}
      {category && !level && <span className="text-ink/35">· {category}</span>}
    </span>
  );
}
