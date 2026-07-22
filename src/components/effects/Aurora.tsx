/**
 * Soft drifting nebula glow behind the starfield. Pure CSS, GPU-friendly,
 * and silenced under prefers-reduced-motion (handled globally in globals.css).
 */
export function Aurora() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <div className="absolute -left-[15%] top-[-10%] h-[55vh] w-[55vh] rounded-full bg-violet-chakra/20 blur-[70px] animate-aurora animate-pulse-glow" />
      <div className="absolute right-[-12%] top-[20%] h-[50vh] w-[50vh] rounded-full bg-brand-cyan/15 blur-[70px] animate-aurora-slow" />
      <div className="absolute bottom-[-15%] left-[25%] h-[48vh] w-[48vh] rounded-full bg-gold-soft/12 blur-[70px] animate-aurora" style={{ animationDelay: '6s' }} />
    </div>
  );
}
