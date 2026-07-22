import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { SparkleUnderline } from '@/components/motion/SparkleUnderline';

export function SectionHeading({
  eyebrow, title, subtitle, center = true, glow = false,
}: { eyebrow?: string; title: ReactNode; subtitle?: string; center?: boolean; glow?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}
    >
      {eyebrow && <span className="eyebrow mb-3">✦ {eyebrow}</span>}
      <h2 className="font-heading text-h2 text-white">{title}</h2>
      {glow && <SparkleUnderline className="mt-4" />}
      {subtitle && <p className="mt-4 text-body leading-relaxed text-white/60">{subtitle}</p>}
    </motion.div>
  );
}
