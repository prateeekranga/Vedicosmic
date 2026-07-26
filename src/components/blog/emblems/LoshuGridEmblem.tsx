/** Static 3×3 Lo Shu magic-square grid — numerology's category emblem. */
export function LoshuGridEmblem({ className = '' }: { className?: string }) {
  const rows = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ];
  const cell = 56;
  const gap = 6;
  const size = cell * 3 + gap * 4;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden="true">
      {rows.map((row, r) =>
        row.map((n, c) => {
          const x = gap + c * (cell + gap);
          const y = gap + r * (cell + gap);
          return (
            <g key={`${r}-${c}`}>
              <rect x={x} y={y} width={cell} height={cell} rx={10}
                fill="rgba(230,184,74,0.08)" stroke="rgba(230,184,74,0.45)" strokeWidth={1.2} />
              <text x={x + cell / 2} y={y + cell / 2 + 10} textAnchor="middle"
                fontSize={28} fontFamily="'Cinzel', serif" fill="#F0D080">{n}</text>
            </g>
          );
        }),
      )}
    </svg>
  );
}
