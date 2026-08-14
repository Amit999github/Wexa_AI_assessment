const PALETTE = ['#2F6FED', '#1C9D6C', '#DE9A34', '#7C5CE0', '#D64545', '#0EA5A5'];

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initialsFor(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Avatar({ name, size = 40 }) {
  const bg = colorFor(name || '?');
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ backgroundColor: bg, width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initialsFor(name || '?')}
    </div>
  );
}
