/** Concentric breath rings pulsing around a soft central orb — meditation & yoga's category emblem. */
export function BreathRingsEmblem({ className = '' }: { className?: string }) {
  const cx = 100;
  const cy = 100;
  const rings = [20, 40, 60, 80];

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx={cx} cy={cy} r={14} fill="rgba(125,211,252,0.5)" />
      {rings.map((r, i) => (
        <circle key={r} cx={cx} cy={cy} r={r} stroke="rgba(125,211,252,0.3)" strokeWidth={0.8} fill="none">
          <animate attributeName="r" values={`${r};${r + 12};${r}`} dur="6s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.05;0.5" dur="6s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}
