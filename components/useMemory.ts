"use client";
// PERSON 1 OWNS components/. Reads the saved memory on the client.
import { useEffect, useState } from "react";
import { loadMemory } from "@/lib/store";
import type { Memory } from "@/types/schema";

export function useMemory() {
  const [memory, setMemory] = useState<Memory | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMemory(loadMemory());
    setReady(true);
  }, []);
  return { memory, ready };
}
