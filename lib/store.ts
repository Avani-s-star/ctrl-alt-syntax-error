// SHARED. All storage goes through this file.
// Today: browser localStorage. Upgrade path (add-on 1): swap these two functions for Supabase calls.
import type { Memory } from "@/types/schema";

const KEY = "team-memory:v1";

export function saveMemory(m: Memory) {
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* storage full or blocked — ignore */
  }
}

export function loadMemory(): Memory | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Memory) : null;
  } catch {
    return null;
  }
}

export function clearMemory() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
