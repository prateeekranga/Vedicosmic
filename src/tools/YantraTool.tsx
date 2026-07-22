import { useState } from 'react';
import { motion } from 'framer-motion';
import { YANTRAS, type Yantra } from '@/data/yantras';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const PHI = 1.6180339887;

function circlesAround(cx: number, cy: number, r: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
}

function YantraArt({ y }: { y: Yantra }) {
  const S = 300, c = S / 2;
  const stroke = '#39B7F0', gold = '#FFD700';
  const draw = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
  };
  const spin = { rotate: 360 };
  const spinT = { duration: 80, repeat: Infinity, ease: 'linear' as const };

  let body: JSX.Element;
  switch (y.kind) {
    case 'sri': {
      const ups = [70, 105, 130]; const downs = [60, 95, 120];
      body = (
        <g>
          {ups.map((r, i) => (
            <motion.polygon key={'u' + i} variants={draw} transition={{ duration: 1.4, delay: i * 0.2 }}
              points={`${c},${c - r} ${c - r * 0.87},${c + r * 0.5} ${c + r * 0.87},${c + r * 0.5}`}
              fill="none" stroke={gold} strokeWidth="1.2" />
          ))}
          {downs.map((r, i) => (
            <motion.polygon key={'d' + i} variants={draw} transition={{ duration: 1.4, delay: 0.3 + i * 0.2 }}
              points={`${c},${c + r} ${c - r * 0.87},${c - r * 0.5} ${c + r * 0.87},${c - r * 0.5}`}
              fill="none" stroke={stroke} strokeWidth="1.2" />
          ))}
          <motion.circle cx={c} cy={c} r="5" fill={gold} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }} />
        </g>
      );
      break;
    }
    case 'flower': case 'seed': {
      const rings = y.kind === 'seed' ? 1 : 2; const r = 34;
      const centers = [{ x: c, y: c }];
      for (let ring = 1; ring <= rings; ring++)
        circlesAround(c, c, r * ring, 6 * ring).forEach((p) => centers.push(p));
      body = (
        <g>
          {centers.map((p, i) => (
            <motion.circle key={i} cx={p.x} cy={p.y} r={r} fill="none" stroke={i % 2 ? gold : stroke} strokeWidth="1"
              variants={draw} transition={{ duration: 1, delay: i * 0.05 }} />
          ))}
        </g>
      );
      break;
    }
    case 'metatron': {
      const pts = [{ x: c, y: c }, ...circlesAround(c, c, 50, 6), ...circlesAround(c, c, 100, 6)];
      body = (
        <g>
          {pts.flatMap((a, i) => pts.slice(i + 1).map((b, j) => (
            <motion.line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={stroke} strokeWidth="0.4" variants={draw} transition={{ duration: 1.5, delay: (i + j) * 0.01 }} />
          )))}
          {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="14" fill="none" stroke={gold} strokeWidth="0.8" />)}
        </g>
      );
      break;
    }
    case 'fibonacci': case 'golden': {
      const path: string[] = []; let x = c - 40, yy = c - 20, size = 8, dir = 0;
      for (let i = 0; i < 9; i++) {
        const next = size * (y.kind === 'golden' ? PHI : (i < 2 ? 1 : 1.6));
        path.push(`M ${x} ${yy} a ${size} ${size} 0 0 1 ${dir % 2 === 0 ? size : -size} ${dir % 2 === 0 ? size : size}`);
        size = next;
      }
      // Simpler reliable golden spiral via sampled logarithmic curve:
      const pts: string[] = [];
      for (let t = 0; t < 6 * Math.PI; t += 0.1) {
        const r = 2 * Math.exp(0.1 * t * Math.log(PHI) / (Math.PI / 2));
        pts.push(`${c + r * Math.cos(t)},${c + r * Math.sin(t)}`);
      }
      body = (
        <g>
          <motion.polyline points={pts.join(' ')} fill="none" stroke={gold} strokeWidth="1.5"
            variants={draw} transition={{ duration: 2.2 }} />
          {[3, 5, 8, 13, 21, 34].map((f, i) => (
            <circle key={i} cx={c} cy={c} r={f * 1.6} fill="none" stroke={stroke} strokeWidth="0.4" opacity="0.4" />
          ))}
        </g>
      );
      break;
    }
    case 'platonic': {
      const hex = circlesAround(c, c, 90, 6);
      body = (
        <g>
          <motion.polygon points={hex.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={gold} strokeWidth="1.2"
            variants={draw} transition={{ duration: 1.4 }} />
          {hex.map((p, i) => (
            <motion.line key={i} x1={c} y1={c} x2={p.x} y2={p.y} stroke={stroke} strokeWidth="0.8"
              variants={draw} transition={{ duration: 1, delay: i * 0.1 }} />
          ))}
          <motion.polygon points={hex.filter((_, i) => i % 2 === 0).map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none" stroke={stroke} strokeWidth="1" variants={draw} transition={{ duration: 1.4, delay: 0.6 }} />
        </g>
      );
      break;
    }
    default: { // torus
      body = (
        <g>
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * 2 * Math.PI;
            return (
              <motion.ellipse key={i} cx={c} cy={c} rx="110" ry="40"
                fill="none" stroke={i % 2 ? gold : stroke} strokeWidth="0.7"
                transform={`rotate(${(i / 14) * 180} ${c} ${c})`}
                variants={draw} transition={{ duration: 1.2, delay: i * 0.06 }} />
            );
          })}
        </g>
      );
    }
  }

  // extra shapes handled outside the primary switch for clarity
  if (y.kind === 'vesica') {
    const r = 78, off = r / 2;
    body = (
      <g>
        <motion.circle cx={c - off} cy={c} r={r} fill="none" stroke={stroke} strokeWidth="1.2" variants={draw} transition={{ duration: 1.4 }} />
        <motion.circle cx={c + off} cy={c} r={r} fill="none" stroke={stroke} strokeWidth="1.2" variants={draw} transition={{ duration: 1.4, delay: 0.2 }} />
        <motion.path d={`M ${c} ${c - Math.sqrt(r * r - off * off)} A ${r} ${r} 0 0 1 ${c} ${c + Math.sqrt(r * r - off * off)} A ${r} ${r} 0 0 1 ${c} ${c - Math.sqrt(r * r - off * off)}`}
          fill="rgba(255,215,0,0.06)" stroke={gold} strokeWidth="1.4" variants={draw} transition={{ duration: 1.6, delay: 0.5 }} />
        <motion.circle cx={c} cy={c} r="4" fill={gold} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }} />
      </g>
    );
  } else if (y.kind === 'shatkona' || y.kind === 'merkaba') {
    const r = 115;
    const up = `${c},${c - r} ${c - r * 0.87},${c + r * 0.5} ${c + r * 0.87},${c + r * 0.5}`;
    const dn = `${c},${c + r} ${c - r * 0.87},${c - r * 0.5} ${c + r * 0.87},${c - r * 0.5}`;
    const upPts = [{ x: c, y: c - r }, { x: c - r * 0.87, y: c + r * 0.5 }, { x: c + r * 0.87, y: c + r * 0.5 }];
    const dnPts = [{ x: c, y: c + r }, { x: c - r * 0.87, y: c - r * 0.5 }, { x: c + r * 0.87, y: c - r * 0.5 }];
    body = (
      <g>
        <motion.polygon points={up} fill="none" stroke={gold} strokeWidth="1.4" variants={draw} transition={{ duration: 1.4 }} />
        <motion.polygon points={dn} fill="none" stroke={stroke} strokeWidth="1.4" variants={draw} transition={{ duration: 1.4, delay: 0.3 }} />
        {y.kind === 'merkaba' && (
          <>
            {upPts.map((p, i) => <motion.line key={'ua' + i} x1={p.x} y1={p.y} x2={c} y2={c} stroke={gold} strokeWidth="0.5" opacity="0.6" variants={draw} transition={{ duration: 1, delay: 0.6 + i * 0.1 }} />)}
            {dnPts.map((p, i) => <motion.line key={'da' + i} x1={p.x} y1={p.y} x2={c} y2={c} stroke={stroke} strokeWidth="0.5" opacity="0.6" variants={draw} transition={{ duration: 1, delay: 0.8 + i * 0.1 }} />)}
          </>
        )}
        <motion.circle cx={c} cy={c} r="4" fill={gold} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }} />
      </g>
    );
  } else if (y.kind === 'pentagram') {
    const r = 120;
    const pts = Array.from({ length: 5 }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      return { x: c + r * Math.cos(a), y: c + r * Math.sin(a) };
    });
    const star = [0, 2, 4, 1, 3].map((i) => `${pts[i].x},${pts[i].y}`).join(' ');
    body = (
      <g>
        <motion.polygon points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.5" variants={draw} transition={{ duration: 1.4 }} />
        <motion.polygon points={star} fill="rgba(255,215,0,0.05)" stroke={gold} strokeWidth="1.5" variants={draw} transition={{ duration: 2 }} />
        <motion.circle cx={c} cy={c} r={r} fill="none" stroke={stroke} strokeWidth="0.4" opacity="0.3" variants={draw} transition={{ duration: 1.6 }} />
      </g>
    );
  } else if (y.kind === 'octagram') {
    const s = 84;
    const sq = (rot: number, col: string, d: number) => (
      <motion.rect x={c - s} y={c - s} width={s * 2} height={s * 2} rx="4" fill="none" stroke={col} strokeWidth="1.3"
        transform={`rotate(${rot} ${c} ${c})`} variants={draw} transition={{ duration: 1.4, delay: d }} />
    );
    body = (
      <g>
        {sq(0, gold, 0)}
        {sq(45, stroke, 0.3)}
        <motion.circle cx={c} cy={c} r={s * 1.19} fill="none" stroke={stroke} strokeWidth="0.4" opacity="0.3" variants={draw} transition={{ duration: 1.6 }} />
        <motion.circle cx={c} cy={c} r="4" fill={gold} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }} />
      </g>
    );
  } else if (y.kind === 'treeoflife') {
    const N: Record<number, { x: number; y: number }> = {
      1: { x: 150, y: 34 }, 2: { x: 214, y: 78 }, 3: { x: 86, y: 78 },
      4: { x: 214, y: 140 }, 5: { x: 86, y: 140 }, 6: { x: 150, y: 168 },
      7: { x: 214, y: 214 }, 8: { x: 86, y: 214 }, 9: { x: 150, y: 236 }, 10: { x: 150, y: 278 },
    };
    const paths: [number, number][] = [[1, 2], [1, 3], [1, 6], [2, 3], [2, 4], [2, 6], [3, 5], [3, 6], [4, 5], [4, 6], [4, 7], [5, 6], [5, 8], [6, 7], [6, 8], [6, 9], [7, 8], [7, 9], [7, 10], [8, 9], [8, 10], [9, 10]];
    body = (
      <g>
        {paths.map(([a, b], i) => (
          <motion.line key={i} x1={N[a].x} y1={N[a].y} x2={N[b].x} y2={N[b].y} stroke={stroke} strokeWidth="0.7"
            variants={draw} transition={{ duration: 1.2, delay: i * 0.03 }} />
        ))}
        {Object.entries(N).map(([k, p], i) => (
          <motion.circle key={k} cx={p.x} cy={p.y} r="12" fill="rgba(255,215,0,0.08)" stroke={gold} strokeWidth="1.1"
            variants={draw} transition={{ duration: 0.8, delay: 0.3 + i * 0.06 }} />
        ))}
      </g>
    );
  }

  return (
    <motion.svg viewBox={`0 0 ${S} ${S}`} className="mx-auto h-auto w-full max-w-[300px]"
      initial="initial" animate="animate">
      <motion.g animate={spin} transition={spinT} style={{ transformOrigin: 'center' }}>
        {body}
      </motion.g>
    </motion.svg>
  );
}

export default function YantraTool() {
  const [idx, setIdx] = useState(0);
  const y = YANTRAS[idx];
  return (
    <div className="space-y-8">
      <div>
        <span className="eyebrow">Choose a form · {YANTRAS.length} geometries</span>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {YANTRAS.map((yy, i) => (
            <button key={yy.id} onClick={() => setIdx(i)}
              className={`rounded-xl border px-3 py-2.5 text-center text-sm transition-all ${
                i === idx ? 'border-gold-soft/60 bg-gold-bright/10 text-gold-pale shadow-glow-gold' : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white/80'
              }`}>{yy.name}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="flex items-center justify-center p-6">
          <YantraArt key={y.id} y={y} />
        </Card>
        <motion.div key={y.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div>
            <Badge tone="violet">Sacred Geometry</Badge>
            <h3 className="mt-3 font-heading text-h2 text-white">{y.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/65">{y.description}</p>
          </div>
          <Card className="p-5">
            <span className="eyebrow">The mathematics</span>
            <ul className="mt-3 space-y-2">
              {y.math.map((m, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex gap-2 font-mono text-sm text-brand-cyan-soft"><span className="text-gold-soft">·</span>{m}</motion.li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <span className="eyebrow">In tradition</span>
            <p className="mt-2 text-sm leading-relaxed text-white/65">{y.tradition}</p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
