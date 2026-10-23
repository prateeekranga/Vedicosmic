import type { ToolCategory } from '@/types/tool.types';

const NOTE: Record<ToolCategory, string> = {
  astrology: 'Astrology offers tradition-based reflection, not guarantees.',
  numerology: 'Numerology offers tradition-based reflection, not guarantees.',
  cosmology: 'Offered for reflection and practice, following tradition. Not a guarantee of any outcome.',
  energy: 'Offered for reflection and practice, not as medical treatment. If you have a health concern, please see a doctor.',
};

/** One plain line under every tool, so no result reads as a promise or a treatment. */
export function ResultNote({ category }: { category: ToolCategory }) {
  return <p className="mt-6 text-center text-xs text-white/45">{NOTE[category]}</p>;
}
