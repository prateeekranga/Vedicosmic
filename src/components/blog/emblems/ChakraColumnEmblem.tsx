/** Vertical column of 7 glowing circles, root→crown — energy's category emblem. */
export function ChakraColumnEmblem({ className = '' }: { className?: string }) {
  const colors = ['#E63427', '#F0803C', '#E6B84A', '#34D399', '#7DD3FC', '#6366F1', '#F5F0FF'];
  const cx = 100;
  const gap = 26;
  const startY = 184;

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <line x1={cx} y1={20} x2={cx} y2={190} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
      {colors.map((color, i) => {
        const cy = startY - i * gap;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={13} fill={color} opacity={0.16} />
            <circle cx={cx} cy={cy} r={8} fill={color} opacity={0.9} />
            <circle cx={cx} cy={cy} r={8} stroke={color} strokeWidth={1} fill="none" opacity={0.5}>
              <animate attributeName="r" values="8;11;8" dur="3.5s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="3.5s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}
