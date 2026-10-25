"use client";

import { useEffect, useState } from "react";

type CounterProps = {
  from: number;
  to: number;
  duration?: number;
};

export default function Counter({
  from,
  to,
  duration = 450,
}: CounterProps) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (duration <= 0) {
      setValue(to);
      return;
    }

    let startTime: number | null = null;
    let frameId = 0;
    let cancelled = false;

    const animate = (time: number) => {
      if (cancelled) return;

      if (startTime === null) {
        startTime = time;
      }

      const progress = Math.min(
        (time - startTime) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(
        Math.round(from + (to - from) * eased)
      );

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    setValue(from);
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [from, to, duration]);

  return <span>{value}</span>;
}