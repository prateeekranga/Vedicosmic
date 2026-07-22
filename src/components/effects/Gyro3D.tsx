/**
 * A true-3D armillary "gyroscope" of glowing rings, built with CSS 3D
 * transforms (perspective + preserve-3d) rotating on independent axes.
 * Purely decorative; pauses under prefers-reduced-motion (globals.css).
 */
export function Gyro3D({ className = '' }: { className?: string }) {
  const ring = 'absolute inset-0 rounded-full border';
  return (
    <div className={`pointer-events-none ${className}`} style={{ perspective: '900px' }} aria-hidden>
      <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
        {/* glowing core */}
        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,224,140,0.9), rgba(255,183,43,0.3) 60%, transparent 75%)', filter: 'blur(2px)', boxShadow: '0 0 40px 8px rgba(255,183,43,0.4)' }} />

        {/* three rings on different axes */}
        <div className={`${ring} animate-spin3d-y`} style={{ borderColor: 'rgba(255,215,0,0.35)', boxShadow: '0 0 24px rgba(255,215,0,0.12) inset', transformStyle: 'preserve-3d' }} />
        <div className={`${ring} animate-spin3d-x`} style={{ borderColor: 'rgba(57,183,240,0.32)', transform: 'rotateY(60deg)', transformStyle: 'preserve-3d' }} />
        <div className={`${ring} animate-spin3d-tilt`} style={{ borderColor: 'rgba(139,92,246,0.30)' }} />

        {/* inner counter-rotating rings */}
        <div className="absolute inset-[14%] rounded-full border animate-spin3d-z" style={{ borderColor: 'rgba(13,148,136,0.3)', transform: 'rotateX(55deg)' }} />
        <div className="absolute inset-[26%] rounded-full border animate-spin3d-y" style={{ borderColor: 'rgba(255,215,0,0.25)', transform: 'rotateY(45deg)', animationDirection: 'reverse' }} />
      </div>
    </div>
  );
}
