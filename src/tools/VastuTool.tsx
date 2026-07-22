import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Compass, Sparkles, Check, X as XIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Accordion } from '@/components/ui/Accordion';

/** Eight directions + centre, on a North-up 3×3 plan of the Vāstu Puruṣa Maṇḍala.
 *  Room lists follow the classical directional chart and the Viśwakarma Vāstuśāstram. */
interface Dir {
  id: string; name: string; short: string; row: number; col: number;
  element: string; ruler: string; note: string;
  recommended: string[]; avoid: string[];
}
const DIRS: Dir[] = [
  { id: 'NW', name: 'North-West', short: 'NW', row: 0, col: 0, element: 'Air', ruler: 'Vāyu',
    note: 'The airy quarter of movement — things here should keep moving, so guests and stores that turn over suit it.',
    recommended: ['Guest bedroom', 'Dining & study room', 'Grocery / cow shed', 'Room for elders', 'Children’s room', 'Washing place', 'Septic tank', 'Toilet', 'Parking / garage'],
    avoid: ['Master bedroom', 'Kitchen'] },
  { id: 'N', name: 'North', short: 'N', row: 0, col: 1, element: 'Water', ruler: 'Kubera',
    note: 'The quarter of wealth and opportunity — keep it open, light and lower than the south.',
    recommended: ['Treasury / cash', 'Living room', 'Main entrance', 'Bathroom', 'More open space'],
    avoid: ['Bedrooms', 'Heavy storage'] },
  { id: 'NE', name: 'North-East', short: 'NE', row: 0, col: 2, element: 'Water · Ether', ruler: 'Īśāna',
    note: 'Īśānya — the most sacred, luminous corner where the Vāstu Puruṣa’s head rests. Keep it open, clean and lowest.',
    recommended: ['Temple / meditation room', 'Main entrance', 'Porch', 'Balcony / verandah', 'Underground water tank'],
    avoid: ['Toilet', 'Kitchen', 'Septic tank', 'Staircase', 'Heavy storage'] },
  { id: 'W', name: 'West', short: 'W', row: 1, col: 0, element: 'Water', ruler: 'Varuṇa',
    note: 'The quarter of gains and stability in relationships — good for rooms of rest and study.',
    recommended: ['Dining room', 'Children’s bedroom', 'Study room', 'Overhead water tank', 'Toilet / septic tank'],
    avoid: ['Cellar / basement'] },
  { id: 'C', name: 'Brahmasthan', short: '◉', row: 1, col: 1, element: 'Ether', ruler: 'Brahma',
    note: 'The navel of the Maṇḍala — the sacred centre. Keep it weightless, open and unbuilt.',
    recommended: ['Open space / courtyard', 'More light & air', 'Tulsi plant'],
    avoid: ['Toilet', 'Staircase', 'Pillars / beams', 'Heavy construction'] },
  { id: 'E', name: 'East', short: 'E', row: 1, col: 2, element: 'Air · Sun', ruler: 'Indra · Sūrya',
    note: 'The quarter of the rising sun — health and vitality flow from morning light here.',
    recommended: ['Bathrooms (bathing)', 'Living room', 'Guest room', 'Study room', 'More open space'],
    avoid: ['Heavy storage', 'Tall walls blocking light'] },
  { id: 'SW', name: 'South-West', short: 'SW', row: 2, col: 0, element: 'Earth', ruler: 'Nairṛti',
    note: 'Nairṛtya — where the Vāstu Puruṣa’s feet rest. The heaviest, highest, most closed corner for stability.',
    recommended: ['Master bedroom', 'Wardrobes / dressing room', 'Heavy storage & safe', 'Cash box', 'Staircase', 'Overhead water tank'],
    avoid: ['Cellar / pit / well', 'Entrance', 'Underground tank'] },
  { id: 'S', name: 'South', short: 'S', row: 2, col: 1, element: 'Earth', ruler: 'Yama',
    note: 'The quarter of discipline and rest — sleep with the head to the south for deep sleep.',
    recommended: ['Bedroom (head to south)', 'Provision / store room', 'Staircase'],
    avoid: ['Cellar / well', 'Main entrance'] },
  { id: 'SE', name: 'South-East', short: 'SE', row: 2, col: 2, element: 'Fire', ruler: 'Agni',
    note: 'Āgneya — the quarter of fire (Agni). The natural home of the hearth and all things electrical.',
    recommended: ['Kitchen (cook facing east)', 'Electric meter & appliances', 'Store for oil / ghee', 'Toilet & pump'],
    avoid: ['Cellar / well', 'Underground water tank', 'Master bedroom'] },
];

interface Room { id: string; name: string; icon: string; best: string; also: string[]; why: string; tip: string }
const ROOMS: Room[] = [
  { id: 'entrance', name: 'Main Entrance', icon: '🚪', best: 'NE', also: ['N', 'E'], why: 'North, east and north-east draw in prosperity and gentle morning light.', tip: 'Keep it bright, clean and clutter-free; a south-west main door is best avoided.' },
  { id: 'kitchen', name: 'Kitchen', icon: '🔥', best: 'SE', also: ['NW'], why: 'The south-east belongs to Agni, lord of fire — the natural home of the hearth.', tip: 'Cook facing east; keep the stove and sink apart (fire vs water). Avoid a kitchen in the north-east.' },
  { id: 'master', name: 'Master Bedroom', icon: '🛏️', best: 'SW', also: ['S', 'W'], why: 'The heavy, grounding south-west lends stability and restful sleep.', tip: 'Sleep with your head to the south or east; avoid a bedroom in the north-east.' },
  { id: 'pooja', name: 'Pooja / Prayer Room', icon: '🪔', best: 'NE', also: ['E', 'N'], why: 'The north-east (Īśānya) is the most sacred, luminous corner of the home.', tip: 'Face east or north while praying; keep the space open and well-lit.' },
  { id: 'living', name: 'Living Room', icon: '🛋️', best: 'N', also: ['E', 'NE'], why: 'North and east welcome guests, light and flowing social energy.', tip: 'Place heavier furniture toward the south and west, lighter toward the north-east.' },
  { id: 'children', name: 'Children’s Room', icon: '🧸', best: 'W', also: ['NW', 'E'], why: 'The west supports rest and steady concentration for study.', tip: 'A study desk facing east or north aids focus and memory.' },
  { id: 'guest', name: 'Guest Room', icon: '🧳', best: 'NW', also: ['W'], why: 'The airy north-west (Vāyu) suits movement — guests come and go with ease.', tip: 'Good too for a garage or a store that sees frequent activity.' },
  { id: 'dining', name: 'Dining Room', icon: '🍽️', best: 'W', also: ['E', 'N'], why: 'The west sits close to the kitchen and supports nourishment and bonds.', tip: 'Face east or west while eating; keep it adjacent to the kitchen.' },
  { id: 'bath', name: 'Bathroom / Toilet', icon: '🚿', best: 'NW', also: ['W', 'S'], why: 'North-west, west and south handle drainage without draining sacred zones.', tip: 'Avoid toilets in the north-east and the very centre of the home.' },
  { id: 'study', name: 'Study / Office', icon: '📚', best: 'NE', also: ['E', 'N', 'W'], why: 'The north-east and east bring clarity, calm and mental sharpness.', tip: 'Sit facing east or north; keep the desk away from under a beam.' },
  { id: 'store', name: 'Store Room', icon: '📦', best: 'SW', also: ['NW', 'S'], why: 'Heavy stores belong to the weightier south-west, north-west and south.', tip: 'Store grains and valuables in the south-west for security.' },
  { id: 'stairs', name: 'Staircase', icon: '🪜', best: 'SW', also: ['S', 'W'], why: 'Stairs are heavy — the south-west and south carry their weight well.', tip: 'Never place a staircase in the north-east or the centre of the home.' },
  { id: 'water', name: 'Water Tank', icon: '💧', best: 'NE', also: ['SW'], why: 'Underground water sits in the north-east; overhead tanks weigh down the south-west.', tip: 'Underground tank / borewell → NE; overhead tank → SW or west.' },
];

function Chip({ text, ok }: { text: string; ok: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${
      ok ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/30 bg-rose-400/10 text-rose-200'
    }`}>
      {ok ? <Check className="h-3 w-3" /> : <XIcon className="h-3 w-3" />}{text}
    </span>
  );
}

const PRINCIPLES = [
  { id: 'mandala', header: 'The Vāstu Puruṣa Maṇḍala', body: 'Every plot is imagined as the body of the Vāstu Puruṣa, laid face-down with his head in the north-east and feet in the south-west. The site is divided into a grid of padas — classically 9×9 (81) or 8×8 (64) — each ruled by a deity. His open navel, the Brahmasthan at the centre, is always kept free.' },
  { id: 'elements', header: 'The five elements (Pañca Mahābhūta)', body: 'Each corner carries one element: north-east → Water (Jala), south-east → Fire (Agni), south-west → Earth (Pṛthvī), north-west → Air (Vāyu), and the centre → Space / Ether (Ākāśa). Good placement simply keeps these five in balance — fire in the south-east, water in the north-east, weight in the south-west.' },
  { id: 'guardians', header: 'The eight guardians (Aṣṭa Dik-pālas)', body: 'Each direction has a ruling lord: N → Kubera (wealth), NE → Īśāna (spirit), E → Indra & Sūrya (health), SE → Agni (energy), S → Yama (discipline), SW → Nairṛti (stability), W → Varuṇa (gains), NW → Vāyu (movement). Placing each activity in the quarter of a sympathetic lord is the heart of Vāstu.' },
  { id: 'rules', header: 'Golden rules of placement', body: 'Keep the north-east light, open and lower; keep the south-west heavy, higher and closed. Fire (kitchen, electricals) belongs in the south-east; sleep with the head to the south. Leave the centre open. Avoid clutter, leaks or toilets in the north-east — the home’s most sacred quarter.' },
];

export default function VastuTool() {
  const [roomId, setRoomId] = useState('kitchen');
  const [dirId, setDirId] = useState<string | null>(null);
  const room = ROOMS.find((r) => r.id === roomId)!;
  const ideal = new Set([room.best, ...room.also]);
  const selectedDir = dirId ? DIRS.find((d) => d.id === dirId)! : null;

  return (
    <div className="space-y-8">
      <Card className="p-6 sm:p-8">
        <p className="max-w-2xl text-sm leading-relaxed text-white/60">
          Vāstu Śāstra maps every home onto eight directions, each with its own element and guardian.
          Pick a room to see where it belongs — its ideal direction glows gold, good alternatives glow cyan —
          or tap any direction to see everything that suits it, and what to keep out.
        </p>
        <p className="mt-3 text-xs text-white/35">
          Room chart after the classical directional Vāstu grid; principles grounded in the Viśwakarma Vāstuśāstram (Tanjore Sarasvati Mahal Series).
        </p>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* compass / plan */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="eyebrow flex items-center gap-2"><Compass className="h-4 w-4" /> House plan · North up</span>
            <Badge tone="gold">{room.name}</Badge>
          </div>
          <div className="mx-auto grid aspect-square w-full max-w-[400px] grid-cols-3 grid-rows-3 gap-2">
            {DIRS.map((d) => {
              const isBest = d.id === room.best;
              const isAlso = ideal.has(d.id) && !isBest;
              const isCenter = d.id === 'C';
              const active = dirId === d.id;
              return (
                <motion.button key={d.id} onClick={() => setDirId(active ? null : d.id)}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  animate={isBest && !active ? { boxShadow: ['0 0 0px rgba(255,215,0,0)', '0 0 24px rgba(255,215,0,0.45)', '0 0 0px rgba(255,215,0,0)'] } : {}}
                  transition={isBest ? { duration: 2.4, repeat: Infinity } : {}}
                  style={{ gridColumn: d.col + 1, gridRow: d.row + 1 }}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-colors ${
                    isCenter ? 'border-dashed border-white/20 bg-white/[0.02] text-white/50' :
                    isBest ? 'border-gold-soft/70 bg-gold-bright/15 text-gold-pale' :
                    isAlso ? 'border-brand-cyan-400/50 bg-brand-cyan-400/10 text-brand-cyan-soft' :
                    'border-white/10 bg-white/[0.02] text-white/55 hover:border-white/25'
                  } ${active ? 'ring-2 ring-white/50' : ''}`}>
                  <span className="text-base font-semibold leading-none">{d.short}</span>
                  <span className="mt-1 text-[9px] uppercase leading-tight tracking-wide opacity-75">{isCenter ? 'Centre' : d.element.split(' ')[0]}</span>
                </motion.button>
              );
            })}
          </div>
          <div className="mt-4 flex justify-center gap-4 text-[11px] text-white/45">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-gold-bright/70" /> Ideal for {room.name}</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-cyan-400/60" /> Good</span>
          </div>
        </Card>

        {/* room picker + guidance */}
        <div className="space-y-5">
          <div>
            <span className="eyebrow">Choose a room</span>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ROOMS.map((r) => (
                <button key={r.id} onClick={() => { setRoomId(r.id); setDirId(null); }}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                    r.id === roomId ? 'border-gold-soft/60 bg-gold-bright/10 text-gold-pale' : 'border-white/10 text-white/60 hover:border-white/30'
                  }`}>
                  <span>{r.icon}</span><span className="truncate">{r.name}</span>
                </button>
              ))}
            </div>
          </div>

          <motion.div key={selectedDir ? 'dir' + selectedDir.id : 'room' + room.id}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {selectedDir ? (
              <Card className="space-y-4 p-6">
                <div className="flex items-center gap-2">
                  <Badge tone="cyan">{selectedDir.short}</Badge>
                  <h3 className="font-heading text-h3 text-white">{selectedDir.name}</h3>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="text-white/50">Element: <span className="text-white/80">{selectedDir.element}</span></span>
                  <span className="text-white/50">Guardian: <span className="text-white/80">{selectedDir.ruler}</span></span>
                </div>
                <p className="text-sm leading-relaxed text-white/65">{selectedDir.note}</p>
                <div>
                  <span className="eyebrow">Best used for</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">{selectedDir.recommended.map((t) => <Chip key={t} text={t} ok />)}</div>
                </div>
                {selectedDir.avoid.length > 0 && (
                  <div>
                    <span className="eyebrow">Better to avoid</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">{selectedDir.avoid.map((t) => <Chip key={t} text={t} ok={false} />)}</div>
                  </div>
                )}
                <button onClick={() => setDirId(null)} className="text-xs text-gold-soft hover:underline">← Back to {room.name}</button>
              </Card>
            ) : (
              <Card className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-bright/10 text-xl">{room.icon}</span>
                  <div>
                    <h3 className="font-heading text-h3 text-white">{room.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-white/50">
                      Ideal:
                      <span className="rounded-md bg-gold-bright/15 px-2 py-0.5 text-gold-pale">{DIRS.find((d) => d.id === room.best)!.name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm leading-relaxed text-white/65">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold-soft" />{room.why}
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                  <span className="eyebrow flex items-center gap-2"><Home className="h-3.5 w-3.5" /> Vāstu tip</span>
                  <p className="mt-1.5 text-sm text-white/70">{room.tip}</p>
                </div>
                {room.also.length > 0 && (
                  <p className="text-xs text-white/40">
                    Good alternatives: {room.also.map((a) => DIRS.find((d) => d.id === a)!.name).join(' · ')}
                  </p>
                )}
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* classical principles */}
      <div>
        <span className="eyebrow">The science behind it</span>
        <div className="mt-3">
          <Accordion items={PRINCIPLES} defaultOpen="mandala" />
        </div>
      </div>
    </div>
  );
}
