import { motion } from 'framer-motion';
import { HeartPulse, Moon, Wind, Eye } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useChakraPlayer } from '@/hooks/useChakraPlayer';
import { getPreset } from '@/data/chakraPresets';
import type { PresetId } from '@/lib/chakraPlayerEngine';

/** Each mapping is justified by the chakra's own data, not arbitrary:
 *  Heart (639 Hz) — Anahata's own theme is love/compassion/healing, the most literal match.
 *  Sleep Mix — the exact preset already built for this purpose.
 *  Root (396 Hz) — its own `blocked` copy names anxiety directly; the most direct antidote to stress.
 *  Third Eye (852 Hz) — theme is insight/perception, closest to mental focus among the remaining chakras. */
const ACTIONS: { Icon: typeof HeartPulse; title: string; text: string; presetId: PresetId; accent: 'gold' | 'cyan' | 'violet' | 'teal' }[] = [
  { Icon: HeartPulse, title: 'Heart tone', text: 'Traditionally linked with compassion.', presetId: 'heart', accent: 'teal' },
  { Icon: Moon, title: 'Wind down', text: 'The Sleep Mix — a soft pad to rest to.', presetId: 'sleep', accent: 'cyan' },
  { Icon: Wind, title: 'Settle', text: 'The Root tone — traditionally linked with grounding.', presetId: 'root', accent: 'gold' },
  { Icon: Eye, title: 'Focus', text: 'The Third Eye tone — traditionally linked with insight.', presetId: 'third-eye', accent: 'violet' },
];

export function QuickActionCards() {
  const { activePreset, play } = useChakraPlayer();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ACTIONS.map(({ Icon, title, text, presetId, accent }) => {
        const preset = getPreset(presetId);
        const isActive = activePreset === presetId;
        return (
          <motion.div key={title} whileHover={{ y: -2 }}>
            <button type="button" onClick={() => play(presetId)}
              aria-label={`${title} — play the ${preset?.name} tone`} className="block w-full text-left">
              <Card hover accent={accent} className={`h-full p-5 ${isActive ? 'border-white/25' : ''}`}>
                <span className="grid h-11 w-11 place-items-center rounded-xl"
                  style={{ background: `${preset?.color}1A`, color: preset?.color }}>
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-medium text-white">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/55">{text}</p>
              </Card>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
