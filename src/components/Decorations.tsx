import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "./Icons";

const stars = Array.from({ length: 46 }, (_, i) => ({
  left: ((i * 37 + 11) % 997) / 10,
  top: ((i * 61 + 23) % 991) / 10,
  size: i % 9 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
  delay: (i % 9) * -1.3,
  duration: 4 + (i % 5),
}));

export function NightSky() {
  return (
    <div className="night-sky" aria-hidden="true">
      <div className="sky-glow sky-glow--rose" />
      <div className="sky-glow sky-glow--violet" />
      <svg className="sky-constellation" viewBox="0 0 500 500" fill="none">
        <path d="m35 270 65-80 66 34 28-93 77 37M100 190l-9-71M166 224l61 73 79-35" />
        <circle cx="35" cy="270" r="3" /><circle cx="100" cy="190" r="4" /><circle cx="166" cy="224" r="3" /><circle cx="194" cy="131" r="4" /><circle cx="271" cy="168" r="3" /><circle cx="227" cy="297" r="3" /><circle cx="306" cy="262" r="4" />
      </svg>
      {stars.map((star, i) => (
        <span key={i} className={`sky-star ${i % 9 === 0 ? "sky-star--cross" : ""}`} style={{ left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size, animationDelay: `${star.delay}s`, animationDuration: `${star.duration}s` }} />
      ))}
      <Icon name="moon" className="ambient-moon" size={64} />
      <Icon name="heart" className="floating-heart floating-heart--one" size={18} />
      <Icon name="heart" className="floating-heart floating-heart--two" size={13} />
      <Icon name="heart" className="floating-heart floating-heart--three" size={16} />
      <Icon name="sparkles" className="floating-sparkle" size={20} />
    </div>
  );
}

export function HeartArtwork() {
  const id = useId().replace(/:/g, "");
  return (
    <svg className="heart-artwork" viewBox="0 0 280 270" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-pink`} x1="65" y1="35" x2="213" y2="223" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffe0eb" /><stop offset=".38" stopColor="#efa8c5" /><stop offset=".75" stopColor="#d878a2" /><stop offset="1" stopColor="#a84778" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="60" y1="42" x2="143" y2="178" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity=".75" /><stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-halo`}><stop stopColor="#d786ae" stopOpacity=".22" /><stop offset="1" stopColor="#d786ae" stopOpacity="0" /></radialGradient>
        <filter id={`${id}-shadow`} x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#d478a5" floodOpacity=".24" /></filter>
      </defs>
      <circle cx="140" cy="139" r="126" fill={`url(#${id}-halo)`} />
      <ellipse cx="140" cy="149" rx="128" ry="83" transform="rotate(-24 140 149)" stroke="#c7a3b4" strokeOpacity=".35" />
      <circle cx="35" cy="192" r="4" fill="#e8c58d" />
      <path d="m235 37 3.5 10.5L249 51l-10.5 3.5L235 65l-3.5-10.5L221 51l10.5-3.5L235 37Z" fill="#e8c58d" />
      <path d="m43 63 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" fill="#f2c4d6" />
      <circle cx="216" cy="214" r="2.5" fill="#f2c4d6" />
      <g filter={`url(#${id}-shadow)`}>
        <path d="M140 229C128 220 35 155 29 101 20 48 76 20 111 46c12 9 23 24 29 37 8-18 25-40 47-43 42-6 68 32 56 76-13 47-72 94-103 113Z" fill={`url(#${id}-pink)`} />
        <path d="M43 91c-3-29 23-48 46-39 14 5 24 18 29 29-26-10-45 3-49 25-3 17 7 33 18 45-23-17-41-37-44-60Z" fill={`url(#${id}-shine)`} />
        <path d="M52 78c8-17 24-22 38-16" stroke="white" strokeOpacity=".58" strokeWidth="4" strokeLinecap="round" />
      </g>
      <path d="m244 129 2.5 7.5 7.5 2.5-7.5 2.5-2.5 7.5-2.5-7.5-7.5-2.5 7.5-2.5 2.5-7.5Z" fill="#f5d6e2" />
    </svg>
  );
}

export function HeartConfetti() {
  return (
    <div className="heart-confetti" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => {
        const angle = (i / 22) * Math.PI * 2;
        const distance = 130 + (i % 5) * 35;
        return <span key={i} className={`confetti-piece ${i % 3 === 0 ? "confetti-piece--heart" : ""}`} style={{ "--x": `${Math.cos(angle) * distance}px`, "--y": `${Math.sin(angle) * distance + 90}px`, "--rotation": `${i * 31}deg`, animationDelay: `${(i % 4) * 0.06}s`, backgroundColor: ["#e8a4bf", "#d8c1ec", "#e6c68e"][i % 3] } as CSSProperties}>{i % 3 === 0 && <Icon name="heart" size={12} />}</span>;
      })}
    </div>
  );
}

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, rootMargin: "0px 0px -20px 0px" });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>{children}</div>;
}
