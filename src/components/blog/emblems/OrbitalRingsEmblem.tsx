/** Concentric orbital rings with planet dots circling a central Sun — cosmology's category emblem. */
export function OrbitalRingsEmblem({ className = '' }: { className?: string }) {
  const cx = 100;
  const cy = 100;
  const rings = [
    { r: 36, color: '#0D9488', angle: 20 },
    { r: 56, color: '#7DD3FC', angle: 140 },
    { r: 74, color: '#8B5CF6', angle: 250 },
    { r: 90, color: '#E6B84A', angle: 320 },
  ];

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx={cx} cy={cy} r={12} fill="#FFD700" opacity={0.9} />
      <circle cx={cx} cy={cy} r={20} fill="rgba(255,215,0,0.15)" />
      {rings.map((ring, i) => {
        const a = (ring.angle * Math.PI) / 180;
        const px = cx + Math.cos(a) * ring.r;
        const py = cy + Math.sin(a) * ring.r;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={ring.r} stroke={ring.color} strokeOpacity={0.25} strokeWidth={0.7} fill="none" />
            <circle cx={px} cy={py} r={4} fill={ring.color} />
          </g>
        );
      })}
    </svg>
  );
}
