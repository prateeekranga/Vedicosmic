import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wind, ShieldCheck, Eye, HeartPulse, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RealisticSerpent } from '@/components/effects/RealisticSerpent';

/* Animated companion to the guide video: breath (prāṇa) as the link between
   body and soul, and the three-stage breath method toward samādhi. */

const STAGES = [
  {
    n: 1, title: 'Stabilise the Breath', time: '10 min', breaths: '70–80 breaths', rate: '≈ 7–8 / min',
    points: [
      'Inhale deeply, hold as long as feels natural, exhale gently — one cycle of 10–12 seconds.',
      'Distracting thoughts will tempt the breath to quicken; notice them and stay slow.',
      'The aim of this stage is simply a steady mind amid the noise.',
    ],
    effect: 'Initial breath control · the mind steadies amidst distraction',
  },
  {
    n: 2, title: 'Breath to the Navel', time: '15 min', breaths: '110–115 breaths', rate: '≈ 7–8 / min',
    points: [
      'Shift the attention to the nābhi — feel each breath reach the navel.',
      'The abdomen swells on the inhale and settles on the exhale; hold briefly before releasing.',
      'The outer world quietly loses its importance.',
    ],
    effect: 'The mind grows calm · breath lengthens by itself',
  },
  {
    n: 3, title: 'Whole-Body Awareness', time: '20 min', breaths: '≈ 150 breaths', rate: '≈ 7–8 / min',
    points: [
      'Let awareness of the breath pervade the entire body.',
      'Spine tall and unbound — no belts, no bend — so prāṇa can rise freely.',
      'Energy stirs at the mūlādhāra and climbs the spine toward the ājñā.',
    ],
    effect: 'Detachment from the body · the doorway of samādhi',
  },
];

const CHAKRA_RISE = [
  { name: 'Mūlādhāra', color: '#EF4444' }, { name: 'Svādhiṣṭhāna', color: '#F97316' },
  { name: 'Maṇipūra', color: '#FACC15' }, { name: 'Anāhata', color: '#34D399' },
  { name: 'Viśuddhi', color: '#38BDF8' }, { name: 'Ājñā', color: '#6366F1' },
];

/* ── stage visuals ── */

function BreathCycleOrb() {
  const PHASES = [{ l: 'Inhale', s: 4 }, { l: 'Hold', s: 3 }, { l: 'Exhale', s: 4 }];
  const [p, setP] = useState(0);
  useEffect(() => {
    const id = window.setTimeout(() => setP((x) => (x + 1) % 3), PHASES[p].s * 1000);
    return () => window.clearTimeout(id);
  }, [p]); // eslint-disable-line react-hooks/exhaustive-deps
  const scale = p === 0 ? 1 : p === 1 ? 1 : 0.55;
  return (
    <div className="relative grid h-56 place-items-center">
      <motion.div className="absolute h-44 w-44 rounded-full border border-white/10" />
      <motion.div className="absolute h-44 w-44 rounded-full blur-2xl"
        animate={{ scale, background: p === 1 ? '#FFD70033' : '#39B7F033' }} transition={{ duration: PHASES[p].s, ease: 'easeInOut' }} />
      <motion.div className="h-24 w-24 rounded-full"
        animate={{ scale }} transition={{ duration: PHASES[p].s, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(circle at 40% 35%, #ffffffcc, #39B7F0)', boxShadow: '0 0 50px -8px #39B7F0' }} />
      <motion.p key={p} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute bottom-1 text-sm tracking-widest text-white/70">{PHASES[p].l} · {PHASES[p].s}s</motion.p>
    </div>
  );
}

function Meditator({ mode }: { mode: 'navel' | 'spine' }) {
  const T = 7.2;
  return (
    <div className="relative grid h-56 place-items-center" style={{ perspective: '700px' }}>
      {/* 3D halo ring for depth */}
      <div className="absolute h-48 w-48 rounded-full border border-gold-400/20 animate-spin3d-tilt" />
      <motion.svg viewBox="0 0 200 220" className="h-52 w-auto"
        animate={{ rotateY: [-7, 7, -7] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}>
        {/* seated silhouette */}
        <circle cx="100" cy="46" r="18" fill="rgba(255,255,255,0.14)" />
        <path d="M100 64 C 76 74 70 106 72 138 L 128 138 C 130 106 124 74 100 64 Z" fill="rgba(255,255,255,0.12)" />
        <path d="M40 168 Q 100 132 160 168 Q 130 186 100 184 Q 70 186 40 168 Z" fill="rgba(255,255,255,0.10)" />
        {mode === 'navel' ? (
          <>
            {/* breathing belly */}
            <motion.ellipse cx="100" cy="122" fill="rgba(255,215,0,0.16)" stroke="#FFD700" strokeWidth="1.2"
              animate={{ rx: [16, 26, 26, 16], ry: [12, 19, 19, 12], opacity: [0.55, 1, 1, 0.55] }}
              transition={{ duration: T, times: [0, 0.4, 0.62, 1], repeat: Infinity, ease: 'easeInOut' }} />
            <motion.circle cx="100" cy="122" r="4" fill="#FFD700"
              animate={{ opacity: [0.5, 1, 1, 0.5] }} transition={{ duration: T, times: [0, 0.4, 0.62, 1], repeat: Infinity }}
              style={{ filter: 'drop-shadow(0 0 8px #FFD700)' }} />
            {/* breath stream to nostrils */}
            <motion.path d="M100 56 C 100 78 100 96 100 116" fill="none" stroke="#39B7F0" strokeWidth="1.6"
              strokeDasharray="3 6" animate={{ strokeDashoffset: [18, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }} opacity="0.8" />
          </>
        ) : (
          <>
            {/* straight sushumna */}
            <line x1="100" y1="150" x2="100" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 4" />
            {/* the risen serpent resting along the spine, alive and slithering */}
            <RealisticSerpent progress={1} cx={100} yBase={150} yTop={40} amp={13} wMax={4.6} />
            {CHAKRA_RISE.map((c, i) => {
              const y = 150 - (i * 110) / 5;
              const t0 = (i / 6) * 0.8;
              return (
                <motion.circle key={c.name} cx="100" cy={y} r="6" fill={c.color}
                  animate={{ opacity: [0.15, 0.15, 1, 1], scale: [1, 1, 1.35, 1] }}
                  transition={{ duration: 6.5, times: [0, t0, Math.min(0.98, t0 + 0.08), 1], repeat: Infinity }}
                  style={{ filter: `drop-shadow(0 0 6px ${c.color})`, transformOrigin: `100px ${y}px`, transformBox: 'fill-box' as never }} />
              );
            })}
          </>
        )}
      </motion.svg>
      {mode === 'spine' && (
        <p className="absolute bottom-1 text-[11px] text-white/45">mūlādhāra → ājñā · the upward path of prāṇa</p>
      )}
    </div>
  );
}

/* ── body ↔ breath ↔ soul link ── */
function PranaLink() {
  return (
    <div className="relative mx-auto max-w-md" style={{ perspective: '600px' }}>
      <motion.svg viewBox="0 0 360 120" className="w-full"
        animate={{ rotateX: [6, -6, 6] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}>
        <circle cx="60" cy="60" r="30" fill="rgba(239,68,68,0.12)" stroke="#F87171" strokeWidth="1.2" />
        <text x="60" y="57" textAnchor="middle" fontSize="11" fill="#FCA5A5">Body</text>
        <text x="60" y="71" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)">the gross form</text>
        <circle cx="300" cy="60" r="30" fill="rgba(167,139,250,0.12)" stroke="#A78BFA" strokeWidth="1.2" />
        <text x="300" y="57" textAnchor="middle" fontSize="11" fill="#C4B5FD">Soul</text>
        <text x="300" y="71" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)">energy, unending</text>
        <line x1="92" y1="60" x2="268" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="6" strokeLinecap="round" />
        {/* flowing breath particles */}
        {[0, 1, 2, 3].map((i) => (
          <motion.circle key={i} cy="60" r="3.4" fill="#39B7F0" style={{ filter: 'drop-shadow(0 0 5px #39B7F0)' }}
            animate={{ cx: [96, 264], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3.2, delay: i * 0.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.15, 0.85, 1] }} />
        ))}
        <text x="180" y="44" textAnchor="middle" fontSize="10" fill="#7DD3FC">prāṇa · breath</text>
        <text x="180" y="86" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)">the living link — regulate it, and the link holds steady</text>
      </motion.svg>
    </div>
  );
}

/* ── breath-rate contrast ── */
function RateContrast() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[{ l: 'Restless mind', r: '15–18 / min', d: 3 }, { l: 'Meditator', r: '7–8 / min', d: 8 }].map((x, i) => (
        <div key={x.l} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <motion.span className="mx-auto block h-10 w-10 rounded-full"
            animate={{ scale: [0.65, 1, 0.65] }} transition={{ duration: x.d, repeat: Infinity, ease: 'easeInOut' }}
            style={{ background: i ? 'radial-gradient(circle,#FDE68A,#B8860B)' : 'radial-gradient(circle,#FCA5A5,#7F1D1D)', boxShadow: i ? '0 0 24px -4px #FFD700' : '0 0 18px -6px #F87171' }} />
          <p className="mt-3 text-sm text-white/85">{x.l}</p>
          <p className="font-mono text-xs text-white/45">{x.r}</p>
        </div>
      ))}
    </div>
  );
}

export default function KundaliniBreathGuide() {
  const [stage, setStage] = useState(0);
  const S = STAGES[stage];
  return (
    <div className="mt-8 space-y-6">
      <div>
        <span className="eyebrow">✦ From the guide · the science of breath</span>
        <h3 className="mt-1 font-heading text-h3 text-white">Breath — the bridge to samādhi</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">
          Breath is prāṇa — the life-force that keeps the gross body moving, and the living link between body and soul.
          Energy is never destroyed, only transformed; steady the breath, and the doorway to meditation opens.
        </p>
      </div>

      <Card className="p-6"><PranaLink /></Card>

      {/* three stages */}
      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          {STAGES.map((s, i) => (
            <button key={s.n} onClick={() => setStage(i)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-all ${i === stage ? 'border-gold-400/60 bg-gold-400/10 text-gold-300' : 'border-white/12 text-white/60 hover:text-white'}`}>
              Stage {s.n}
            </button>
          ))}
        </div>
        <Card className="overflow-hidden p-0">
          <div className="grid md:grid-cols-2">
            <motion.div key={stage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-white/8 bg-white/[0.015] md:border-b-0 md:border-r">
              {stage === 0 ? <BreathCycleOrb /> : <Meditator mode={stage === 1 ? 'navel' : 'spine'} />}
            </motion.div>
            <motion.div key={'d' + stage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-heading text-h4 text-white">{S.n}. {S.title}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="gold">{S.time}</Badge>
                <Badge tone="cyan">{S.breaths}</Badge>
                <Badge tone="neutral">{S.rate}</Badge>
              </div>
              <ul className="space-y-2">
                {S.points.map((p, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-start gap-2 text-sm leading-relaxed text-white/65">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-soft" />{p}
                  </motion.li>
                ))}
              </ul>
              <p className="rounded-xl border border-white/8 bg-white/[0.02] p-3 text-xs text-brand-cyan-300/85">✦ {S.effect}</p>
            </motion.div>
          </div>
        </Card>
      </div>

      {/* pillars */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { Icon: ShieldCheck, t: 'Yama & Niyama first', d: 'Breath alone cannot carry you to samādhi — without ethical discipline and a settled mind, the breath will not stay steady.' },
          { Icon: HeartPulse, t: 'Slow breath, long life', d: 'Nature counts our breaths. Meditators breathe slower and deeper — spending fewer breaths, ageing more gently.' },
          { Icon: Eye, t: 'The witness is progress', d: 'Deep peace, and watching the breath as a silent witness, are themselves the signs of advance — samādhi cannot be forced.' },
        ].map(({ Icon, t, d }, i) => (
          <motion.div key={t} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            whileHover={{ rotateX: 4, rotateY: -4, y: -3 }} style={{ transformStyle: 'preserve-3d' }}>
            <Card className="h-full p-5">
              <Icon className="h-5 w-5 text-gold-soft" />
              <p className="mt-2 text-sm font-medium text-white">{t}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/55">{d}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-5 sm:p-6">
        <span className="eyebrow">Breath rate tells the story</span>
        <div className="mt-3"><RateContrast /></div>
      </Card>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-white/40">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300/70" />
        Keep the spine tall and the body unbound — tight belts or a bent posture block the rising prāṇa. Only a few in a
        hundred experience the full ascent at first; every calm sitting is still a step. <Wind className="ml-0.5 inline h-3 w-3" />
      </p>
    </div>
  );
}
