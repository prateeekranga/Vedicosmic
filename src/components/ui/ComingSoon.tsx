import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

/** Shown in place of a page/tool that's admin-gated behind a "Coming Soon" flag. */
export function ComingSoon({ title, blurb }: { title: string; blurb: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="mx-auto max-w-xl p-10 text-center sm:p-14">
        <motion.span
          className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-gold-bright/10 text-gold-soft"
          animate={{ boxShadow: ['0 0 0px rgba(230,184,74,0)', '0 0 28px rgba(230,184,74,0.4)', '0 0 0px rgba(230,184,74,0)'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="h-7 w-7" />
        </motion.span>
        <Badge tone="gold">Coming Soon</Badge>
        <h2 className="mt-4 font-heading text-h3 text-white">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60">{blurb}</p>
      </Card>
    </motion.div>
  );
}
