"use client";
import { useEffect, useState } from "react";
import type { Memory } from "@/types/schema";
import { mockMemory } from "./mock";

// Reads saved data from the browser; falls back to fake data.
export function useMemory() {
  const [memory, setMemory] = useState<Memory | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("memory");
      setMemory(raw ? JSON.parse(raw) : mockMemory);
    } catch {
      setMemory(mockMemory);
    }
  }, []);
  return memory;
}
