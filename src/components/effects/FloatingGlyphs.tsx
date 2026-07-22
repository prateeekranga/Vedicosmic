import { motion } from 'framer-motion';

const GLYPHS = ['ॐ', 'अ', 'श्री', 'ह्रीं', 'क्लीं', 'सो', 'हं', 'गं', 'ऐं', 'ध्यान'];

export function FloatingGlyphs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {GLYPHS.map((g, i) => {
        const left = (i * 37) % 95;
        const top = (i * 53) % 90;
        const dur = 14 + (i % 5) * 4;
        return (
          <motion.span
            key={i}
            className="absolute select-none font-sacred text-brand-cyan-soft"
            style={{ left: `${left}%`, top: `${top}%`, fontSize: `${1.6 + (i % 4) * 0.7}rem`, opacity: 0.07 }}
            animate={{ y: [0, -28, 0], opacity: [0.05, 0.12, 0.05] }}
            transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
          >
            {g}
          </motion.span>
        );
      })}
    </div>
  );
}
