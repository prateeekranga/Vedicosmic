import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, Heart, Sparkles } from 'lucide-react';
import { CRYSTALS, INTENTIONS, type Crystal } from '@/data/crystals';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function CrystalsTool() {
  const [filter, setFilter] = useState<string>('All');
  const [selected, setSelected] = useState<Crystal | null>(null);
  const { user, toggleCrystal } = useAuth();
  const { notify } = useToast();

  const filtered = useMemo(
    () => filter === 'All' ? CRYSTALS : CRYSTALS.filter((c) => c.intentions.includes(filter)),
    [filter],
  );

  const inKit = (id: string) => user?.crystalKit.includes(id) ?? false;

  const toggle = (c: Crystal) => {
    if (!user) { window.dispatchEvent(new CustomEvent('vc:open-auth')); return; }
    toggleCrystal(c.id);
    notify(inKit(c.id) ? `${c.name} removed from your kit` : `${c.name} added to your kit`);
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="eyebrow mb-3 block">Filter by intention</span>
        <div className="flex flex-wrap gap-2">
          {['All', ...INTENTIONS].map((it) => (
            <button key={it} onClick={() => setFilter(it)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
                filter === it ? 'border-brand-cyan/60 bg-brand-cyan/10 text-brand-cyan-soft' : 'border-white/10 text-white/60 hover:border-white/30'
              }`}>{it}</button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((c) => (
            <motion.div key={c.id} layout
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25 }}>
              <Card hover className="group h-full cursor-pointer p-0" >
                <button onClick={() => setSelected(c)} className="w-full text-left">
                  <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-t-2xl"
                    style={{ background: `radial-gradient(circle at 50% 40%, ${c.color}55, transparent 70%)` }}>
                    <motion.div className="h-16 w-16 rotate-45 rounded-lg"
                      style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}66)`, boxShadow: `0 0 30px ${c.color}88` }}
                      animate={{ rotate: [45, 55, 45] }} transition={{ duration: 6, repeat: Infinity }} />
                  </div>
                  <div className="p-5">
                    <div className="font-heading text-lg text-white">{c.name}</div>
                    <p className="mt-1 text-xs text-white/50">{c.headline}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.intentions.slice(0, 3).map((it) => <Badge key={it}>{it}</Badge>)}
                    </div>
                  </div>
                </button>
                <div className="px-5 pb-4">
                  <button onClick={() => toggle(c)}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${inKit(c.id) ? 'text-bindi' : 'text-white/40 hover:text-white/70'}`}>
                    <Heart className={`h-3.5 w-3.5 ${inKit(c.id) ? 'fill-current' : ''}`} />
                    {inKit(c.id) ? 'In your kit' : 'Add to kit'}
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {user && user.crystalKit.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2"><Gem className="h-4 w-4 text-brand-cyan" />
            <span className="eyebrow">Your crystal kit ({user.crystalKit.length})</span></div>
          <div className="mt-3 flex flex-wrap gap-2">
            {user.crystalKit.map((id) => {
              const c = CRYSTALS.find((x) => x.id === id); if (!c) return null;
              return <Badge key={id} tone="cyan">{c.name}</Badge>;
            })}
          </div>
        </Card>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} maxWidth="max-w-lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rotate-45 rounded-lg"
                style={{ background: `linear-gradient(135deg, ${selected.color}, ${selected.color}66)`, boxShadow: `0 0 30px ${selected.color}88` }} />
              <div>
                <h3 className="font-heading text-h3 text-white">{selected.name}</h3>
                <p className="text-sm text-white/55">{selected.headline}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="violet">{selected.chakra} chakra</Badge>
              <Badge tone="gold">{selected.planet}</Badge>
              {selected.zodiac.map((z) => <Badge key={z}>{z}</Badge>)}
            </div>
            <div><span className="eyebrow">Properties</span><p className="mt-1 text-sm leading-relaxed text-white/70">{selected.properties}</p></div>
            <div><span className="eyebrow">How to use</span><p className="mt-1 text-sm leading-relaxed text-white/70">{selected.use}</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><span className="eyebrow">Cleansing</span><p className="mt-1 text-sm text-white/70">{selected.cleanse}</p></div>
              <div><span className="eyebrow">Affirmation</span><p className="mt-1 text-sm italic text-gold-pale">“{selected.mantra}”</p></div>
            </div>
            <Button variant={inKit(selected.id) ? 'outline' : 'cyan'} className="w-full" onClick={() => toggle(selected)}>
              <Heart className={`h-4 w-4 ${inKit(selected.id) ? 'fill-current' : ''}`} />
              {inKit(selected.id) ? 'Remove from kit' : 'Add to my kit'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
