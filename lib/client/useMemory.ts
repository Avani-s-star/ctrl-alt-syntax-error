"use client";
import { useEffect, useState } from "react";
import type { Memory } from "@/types/schema";
import { loadMemory } from "@/lib/store";
import { mockMemory } from "./mock";

// Reads the memory built by the real pipeline (lib/client/build.ts → lib/store.ts).
// Falls back to sample data only if nothing has been built yet.
export function useMemory() {
  const [memory, setMemory] = useState<Memory | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMemory(loadMemory() ?? mockMemory);
  }, []);
  return memory;
}
