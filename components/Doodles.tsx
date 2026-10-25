"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

/* Small hand-drawn style decorations for the landing page */

export function Sparkle({ className = "", color = "#355844", size = 26, delay = 0 }: {
  className?: string; color?: string; size?: number; delay?: number;
}) {
  return (
    <motion.svg aria-hidden width={size} height={size} viewBox="0 0 24 24" className={className}
      animate={{ rotate: [0, 20, 0], scale: [1, 1.15, 1] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}>
      <path d="M12 2 C12.8 8 16 11.2 22 12 C16 12.8 12.8 16 12 22 C11.2 16 8 12.8 2 12 C8 11.2 11.2 8 12 2Z" fill={color} />
    </motion.svg>
  );
}

export function Squiggle({ className = "", color = "#F5C451" }: { className?: string; color?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 14" preserveAspectRatio="none" className={className} fill="none">
      <motion.path d="M2 9 C 25 1, 45 14, 70 7 S 115 1, 135 8 S 180 12, 198 4"
        stroke={color} strokeWidth="4" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 0.9 }} />
    </svg>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 80" className={className} fill="none" stroke="#355844"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <motion.path d="M4 8 C 40 -2, 90 12, 108 60"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1, duration: 0.8 }} />
      <motion.path d="M96 52 L108 62 L112 46"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 1.8, duration: 0.3 }} />
    </svg>
  );
}

export function Sticky({ children, bg, rotate, className = "", delay = 0 }: {
  children: ReactNode; bg: string; rotate: number; className?: string; delay?: number;
}) {
  return (
    <motion.div aria-hidden
      className={`absolute hidden w-40 rounded-md p-3 text-xs font-medium text-[#292F29] shadow-md md:block ${className}`}
      style={{ background: bg, rotate }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
      transition={{
        opacity: { delay: 1 + delay }, scale: { delay: 1 + delay, type: "spring" },
        y: { duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
      }}>
      {children}
    </motion.div>
  );
}

export function Avatars() {
  const people: [string, string][] = [["A", "#E3EBDD"], ["R", "#F0DEDA"], ["K", "#E3EBF0"], ["M", "#F4E8B8"]];
  return (
    <div className="flex -space-x-2">
      {people.map(([l, c], i) => (
        <motion.span key={l} initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.8 + i * 0.08, type: "spring" }} style={{ background: c }}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-[#263D30]">
          {l}
        </motion.span>
      ))}
    </div>
  );
}

export function StepArt({ n }: { n: string }) {
  const draw = (delay: number) => ({
    initial: { pathLength: 0 }, whileInView: { pathLength: 1 },
    viewport: { once: true }, transition: { delay, duration: 0.7 },
  });
  if (n === "01") {
    const bars: [string, number, number, number][] = [["#E3EBDD", 10, 8, 60], ["#E3EBF0", 40, 32, 60], ["#F4E8B8", 70, 56, 52]];
    return (
      <svg viewBox="0 0 140 80" className="h-full" fill="none" aria-hidden>
        {bars.map(([c, x, y, w], i) => (
          <motion.rect key={i} x={x} y={y} height="16" rx="5" fill={c} stroke="#355844" strokeWidth="1.2"
            initial={{ width: 0 }} whileInView={{ width: w }} viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }} />
        ))}
      </svg>
    );
  }
  if (n === "02") {
    return (
      <svg viewBox="0 0 140 80" className="h-full" fill="none" strokeLinecap="round" aria-hidden>
        <motion.path d="M10 40 H50 C70 40 70 18 95 18 H130" stroke="#355844" strokeWidth="2.5" {...draw(0.2)} />
        <motion.path d="M50 40 C70 40 70 62 95 62 H130" stroke="#C6A348" strokeWidth="2.5" strokeDasharray="5 5" {...draw(0.5)} />
        <motion.circle cx="50" cy="40" r="6" fill="#F0DEDA" stroke="#355844" strokeWidth="1.5"
          animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 140 80" className="h-full" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <motion.path d="M30 72 V10" stroke="#355844" strokeWidth="2.5" {...draw(0.1)} />
      <motion.path d="M30 12 H88 L78 26 L88 40 H30Z" fill="#F4E8B8" stroke="#355844" strokeWidth="2"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} />
      <circle cx="112" cy="56" r="11" fill="#E3EBDD" stroke="#355844" strokeWidth="1.5" />
      <motion.path d="M106 56 L110 60 L118 51" stroke="#263D30" strokeWidth="2.5" {...draw(0.8)} />
    </svg>
  );
}
