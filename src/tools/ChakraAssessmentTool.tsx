import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flower2, ChevronRight, RotateCcw } from 'lucide-react';
import { CHAKRAS, chakraStatus } from '@/data/chakras';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

const LIKERT = [
  { v: 1, label: 'Rarely' }, { v: 2, label: 'Sometimes' },
  { v: 3, label: 'Often' }, { v: 4, label: 'Almost always' },
];

// Flatten to 21 questions, tracking chakra index.
const QUESTIONS = CHAKRAS.flatMap((ch, ci) => ch.questions.map((q) => ({ chakra: ci, text: q })));

export default function ChakraAssessmentTool() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const { user, saveReading } = useAuth();
  const { notify } = useToast();

  const scores = useMemo(() => {
    return CHAKRAS.map((_, ci) => {
      const qs = QUESTIONS.map((q, i) => ({ ...q, i })).filter((q) => q.chakra === ci);
      const sum = qs.reduce((s, q) => s + (answers[q.i] ?? 0), 0);
      const max = qs.length * 4;
      return Math.round((sum / max) * 100);
    });
  }, [answers]);

  const answer = (v: number) => {
    setAnswers((a) => ({ ...a, [step]: v }));
    setTimeout(() => {
      if (step + 1 >= QUESTIONS.length) setDone(true);
      else setStep((s) => s + 1);
    }, 180);
  };

  const reset = () => { setStep(0); setAnswers({}); setDone(false); };

  const save = () => {
    const lowest = scores.indexOf(Math.min(...scores));
    saveReading({ toolId: 'chakra-assessment', toolName: 'Chakra Balance',
      summary: `Most open: ${CHAKRAS[scores.indexOf(Math.max(...scores))].name}. Needs attention: ${CHAKRAS[lowest].name}.` });
    notify('Assessment saved to your journal');
  };

  const progress = ((done ? QUESTIONS.length : step) / QUESTIONS.length) * 100;
  const q = QUESTIONS[step];
  const curChakra = CHAKRAS[q?.chakra ?? 0];

  // Radar geometry (7-point)
  const size = 320, cx = size / 2, cy = size / 2, R = 120;
  const pt = (i: number, r: number) => {
    const a = (i / 7) * 2 * Math.PI - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const polygon = scores.map((s, i) => pt(i, (s / 100) * R).join(',')).join(' ');

  return (
    <div className="space-y-8">
      {!done && (
        <Card className="p-6 sm:p-8">
          <div className="mb-6">
            <div className="mb-2 flex justify-between text-xs text-white/50">
              <span>Question {step + 1} of {QUESTIONS.length}</span>
              <span>{curChakra.name}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full" style={{ background: curChakra.color }}
                animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="mb-1 flex items-center gap-2 text-sm" style={{ color: curChakra.color }}>
                <span className="text-lg">{curChakra.bija}</span> {curChakra.sanskrit}
              </div>
              <p className="mb-6 font-heading text-h3 text-white">{q.text}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {LIKERT.map((l) => (
                  <button key={l.v} onClick={() => answer(l.v)}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-cosmic-light/20 px-5 py-4 text-left text-white/80 transition-all hover:border-white/30 hover:bg-white/5">
                    {l.label}
                    <ChevronRight className="h-4 w-4 opacity-40" />
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>
      )}

      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <Card className="p-6">
              <span className="eyebrow mb-2 block text-center">Your energy field</span>
              <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-[340px]">
                {[0.25, 0.5, 0.75, 1].map((f) => (
                  <polygon key={f} points={CHAKRAS.map((_, i) => pt(i, f * R).join(',')).join(' ')}
                    fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                ))}
                {CHAKRAS.map((ch, i) => {
                  const [x, y] = pt(i, R + 18);
                  return <text key={ch.id} x={x} y={y} fontSize="14" textAnchor="middle" dominantBaseline="central" fill={ch.color}>{ch.bija}</text>;
                })}
                <motion.polygon points={polygon} fill="rgba(139,92,246,0.18)" stroke="#8B5CF6" strokeWidth="2"
                  initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 16 }} style={{ transformOrigin: 'center' }} />
                {scores.map((s, i) => { const [x, y] = pt(i, (s / 100) * R);
                  return <circle key={i} cx={x} cy={y} r="3.5" fill={CHAKRAS[i].color} />; })}
              </svg>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {CHAKRAS.map((ch, i) => {
                const st = chakraStatus(scores[i]);
                return (
                  <motion.div key={ch.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}>
                    <Card className="p-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full text-base"
                          style={{ background: `${ch.color}22`, color: ch.color }}>{ch.bija}</span>
                        <div className="flex-1">
                          <div className="font-medium text-white">{ch.name}</div>
                          <div className="text-xs text-white/45">{ch.sanskrit} · {ch.element}</div>
                        </div>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <motion.div className="h-full rounded-full" style={{ background: ch.color }}
                          initial={{ width: 0 }} animate={{ width: `${scores[i]}%` }} transition={{ delay: 0.3 + i * 0.05 }} />
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-white/55">
                        {scores[i] < 45 ? ch.blocked : ch.balanced}
                      </p>
                      <div className="mt-3 text-xs text-white/45">
                        <span className="text-white/60">Restore with:</span> {ch.yoga.slice(0, 2).join(', ')} · crystals: {ch.crystals.slice(0, 2).join(', ')}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="ghost" onClick={reset}><RotateCcw className="h-4 w-4" /> Retake</Button>
              {user
                ? <Button variant="outline" onClick={save}>Save assessment</Button>
                : <button onClick={() => window.dispatchEvent(new CustomEvent('vc:open-auth'))}
                    className="text-sm text-brand-cyan-soft hover:text-brand-cyan">Sign in to save →</button>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
