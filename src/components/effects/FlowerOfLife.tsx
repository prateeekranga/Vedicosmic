/** Flower of Life — 19 overlapping circles, used as a faint sacred backdrop. */
export function FlowerOfLife({ stroke = 'rgba(255,255,255,0.5)' }: { stroke?: string }) {
  const r = 26;
  const pts: [number, number][] = [[0, 0]];
  for (let k = 0; k < 6; k++) {
    const a = (k * 60) * (Math.PI / 180);
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  for (let k = 0; k < 6; k++) {
    const a = (30 + k * 60) * (Math.PI / 180);
    pts.push([Math.cos(a) * r * Math.sqrt(3), Math.sin(a) * r * Math.sqrt(3)]);
  }
  for (let k = 0; k < 6; k++) {
    const a = (k * 60) * (Math.PI / 180);
    pts.push([Math.cos(a) * r * 2, Math.sin(a) * r * 2]);
  }
  return (
    <svg viewBox="-90 -90 180 180" className="h-full w-full" fill="none">
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={r} stroke={stroke} strokeWidth={0.4} />
      ))}
    </svg>
  );
}
