"use client";
import { motion } from "framer-motion";

const blobs = [
  { c: "rgba(14,165,233,0.25)", size: 520, top: "-10%", left: "-8%", dx: 80, dy: 60, d: 18 },
  { c: "rgba(168,85,247,0.22)", size: 480, top: "20%", left: "60%", dx: -90, dy: 70, d: 22 },
  { c: "rgba(239,68,68,0.16)", size: 420, top: "65%", left: "15%", dx: 70, dy: -60, d: 20 },
];

export default function Aurora() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {blobs.map((b, i) => (
        <motion.div key={i}
          animate={{ x: [0, b.dx, 0], y: [0, b.dy, 0] }}
          transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: b.size, height: b.size, top: b.top, left: b.left, background: b.c }}
          className="absolute rounded-full blur-[120px]" />
      ))}
    </div>
  );
}