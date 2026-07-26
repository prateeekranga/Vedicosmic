/** 27-point starry sky-wheel with a glowing Moon glyph at center — astrology's category emblem. */
export function NakshatraWheelEmblem({ className = '' }: { className?: string }) {
  const cx = 100;
  const cy = 100;
  const outerR = 92;
  const points = Array.from({ length: 27 }, (_, i) => {
    const a = (i * 360) / 27 * (Math.PI / 180);
    return { x: cx + Math.cos(a) * outerR, y: cy + Math.sin(a) * outerR, a };
  });

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx={cx} cy={cy} r={outerR} stroke="rgba(125,211,252,0.3)" strokeWidth={0.6} fill="none" />
      <circle cx={cx} cy={cy} r={outerR - 14} stroke="rgba(125,211,252,0.18)" strokeWidth={0.5} fill="none" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i % 3 === 0 ? 2.6 : 1.6}
          fill={i % 3 === 0 ? '#7DD3FC' : 'rgba(125,211,252,0.55)'} />
      ))}
      <circle cx={cx} cy={cy} r={26} fill="rgba(139,92,246,0.10)" stroke="rgba(139,92,246,0.4)" strokeWidth={1} />
      <path d="M 92 78 A 24 24 0 1 0 92 122 A 19 19 0 1 1 92 78 Z" fill="#F0D080" opacity={0.9} />
    </svg>
  );
}
