"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemory } from "@/lib/client/useMemory";
import type { Memory } from "@/types/schema";

type Msg = {
  role: "user" | "ai";
  text: string;
};

const pageEase = [0.22, 1, 0.36, 1] as const;

const suggestions = [
  "Why did we pick Firebase?",
  "What changed about the database?",
  "Which decisions are contradicted?",
];

const STOP = new Set([
  "why", "did", "the", "what", "which", "are", "how", "about",
  "who", "was", "for", "and", "with", "pick", "changed", "have", "has", "does",
]);

// Temporary answer builder.
// Fallback used only if /api/ask fails.
function localAnswer(q: string, memory: Memory): string {
  const lower = q.toLowerCase();

  if (lower.includes("contradict")) {
    const bad = memory.decisions.filter((d) => d.status === "contradicted");

    if (!bad.length) {
      return "No decisions are contradicted right now.";
    }

    return bad
      .map(
        (d) =>
          `${d.who}'s decision "${d.what}" no longer matches the code [${d.sourceId}].`
      )
      .join(" ");
  }

  const words = lower
    .split(/\W+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

  const hits = memory.decisions.filter((d) =>
    words.some((w) =>
      `${d.what} ${d.why} ${d.entities.join(" ")}`.toLowerCase().includes(w)
    )
  );

  if (!hits.length) {
    return "I couldn't find a decision about that in your team's notes.";
  }

  return hits
    .slice(0, 2)
    .map(
      (d) =>
        `${d.who} decided on ${d.date}: ${d.what}, because ${d.why} [${d.sourceId}].` +
        (d.status === "contradicted" ? " But the code no longer matches this." : "")
    )
    .join(" ");
}

/* ---------- Bot avatar ---------- */

const Bot = () => (
  <motion.span
    initial={{ opacity: 0, scale: 0.85 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, ease: pageEase }}
    className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#073358] text-[10px] font-bold text-white"
  >
    TM
  </motion.span>
);

/* ---------- Typing indicator ---------- */

function TypingDots() {
  return (
    <div className="flex gap-1.5 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          className="h-1.5 w-1.5 rounded-full bg-[#073358]"
        />
      ))}
    </div>
  );
}

/* ---------- Source ---------- */

function SourceCard({ doc }: { doc: Memory["docs"][number] }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -4 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, y: -4 }}
      transition={{ duration: 0.3, ease: pageEase }}
      className="mt-3 overflow-hidden"
    >
      <div className="rounded-xl border border-[#D9E0E6] bg-white px-4 py-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#315B7D]">
          Source
        </div>

        <div className="mt-1 text-xs font-semibold text-[#172234]">
          {doc.title}
          <span className="mx-1.5 font-normal text-[#9AA4AF]">·</span>
          <span className="font-medium text-[#526071]">{doc.date}</span>
        </div>

        <p className="mt-2 text-[13px] leading-6 text-[#172234]">“{doc.text}”</p>
      </div>
    </motion.div>
  );
}

export default function Ask() {
  const memory = useMemory();

  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing, open]);

  async function send(text: string) {
    if (!text.trim() || !memory || typing) return;

    setMsgs((m) => [...m, { role: "user", text }]);
    setQ("");
    setTyping(true);

    let answer: string;
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        body: JSON.stringify({
          question: text,
          decisions: memory.decisions,
          contradictions: memory.contradictions,
          docs: memory.docs,
        }),
      });
      const data = await res.json();
      answer = data.answer ?? localAnswer(text, memory);
    } catch {
      answer = localAnswer(text, memory); // AI unavailable → simple keyword answer
    }

    setTyping(false);
    setMsgs((m) => [...m, { role: "ai", text: answer }]);
  }

  const empty = msgs.length === 0;

  return (
    // Adjust 72px to your Nav height so the chat fills the screen exactly.
    <main className="mx-auto flex min-h-[calc(100dvh-72px)] w-full max-w-3xl flex-col px-4 sm:px-6">
      {/* =========================================================
          CONVERSATION
      ========================================================= */}

      <div className="flex-1 py-8">
        {/* EMPTY STATE */}

        {empty && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: pageEase }}
            className="flex h-full min-h-[50vh] flex-col items-center justify-center text-center"
          >
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#073358] text-sm font-bold text-white">
              TM
            </span>

            <h1 className="font-[var(--font-jakarta)] text-3xl font-bold tracking-[-0.035em] text-[#001F3E] sm:text-4xl">
              Ask your team&apos;s memory
            </h1>

            <p className="mt-2 max-w-md text-[14px] leading-6 text-[#526071]">
              Search decisions, reasoning and project context without digging
              through old notes.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {suggestions.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.35 }}
                  whileHover={{ y: -2, borderColor: "#073358" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => send(s)}
                  className="rounded-full border border-[#D9E0E6] bg-white px-4 py-2 text-[13px] font-medium text-[#172234] transition-colors hover:bg-[#EEF3F7]"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* MESSAGES */}

        {!empty && (
          <div className="space-y-5">
            {msgs.map((m, mi) => (
              <motion.div
                key={mi}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: pageEase }}
                className={`flex gap-3 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "ai" && <Bot />}

                <div
                  className={`max-w-[85%] text-[14px] leading-7 sm:max-w-[80%] ${
                    m.role === "user"
                      ? "rounded-2xl rounded-br-md bg-[#073358] px-4 py-2.5 text-white"
                      : "rounded-2xl rounded-bl-md bg-[#F3F6F8] px-4 py-2.5 text-[#172234]"
                  }`}
                >
                  {m.role === "user" ? (
                    m.text
                  ) : (
                    <>
                      <p>
                        {m.text.split(" ").map((tok, ti) => {
                          const cite = tok.match(/^\[(.+)\]([.,]?)$/);
                          const delay = Math.min(ti * 0.03, 1.5);

                          if (cite) {
                            const id = cite[1];
                            const key = `${mi}:${id}`;

                            return (
                              <motion.button
                                key={ti}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay }}
                                onClick={() => setOpen(open === key ? null : key)}
                                className={`mx-1 inline-flex translate-y-[-1px] items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                                  open === key
                                    ? "border-[#073358] bg-[#073358] text-white"
                                    : "border-[#B8C4D2] bg-[#E8EEF2] text-[#073358] hover:bg-[#DCE6ED]"
                                }`}
                              >
                                {id}
                              </motion.button>
                            );
                          }

                          return (
                            <motion.span
                              key={ti}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay }}
                            >
                              {tok}{" "}
                            </motion.span>
                          );
                        })}
                      </p>

                      {/* SOURCE */}

                      <AnimatePresence initial={false}>
                        {open?.startsWith(`${mi}:`) &&
                          (() => {
                            const sourceId = open.split(":")[1];
                            const doc = memory?.docs.find((d) => d.id === sourceId);

                            return doc ? (
                              <SourceCard key={sourceId} doc={doc} />
                            ) : null;
                          })()}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </motion.div>
            ))}

            {/* TYPING */}

            <AnimatePresence>
              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex gap-3"
                >
                  <Bot />
                  <div className="rounded-2xl rounded-bl-md bg-[#F3F6F8] px-4 py-1.5">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div ref={endRef} className="scroll-mb-28" />
      </div>

      {/* =========================================================
          INPUT (pinned to the bottom like a chatbot)
      ========================================================= */}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: pageEase }}
        className="sticky bottom-0 bg-gradient-to-t from-[#F7F8F8] via-[#F7F8F8] to-transparent pb-5 pt-4"
      >
        <div className="flex items-center gap-2 rounded-full border border-[#C9D2DC] bg-white py-1.5 pl-5 pr-1.5 shadow-[0_5px_16px_rgba(0,31,62,0.06)] transition-colors focus-within:border-[#073358]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send(q);
            }}
            placeholder="Ask about a decision..."
            className="min-w-0 flex-1 bg-transparent py-2 text-[14px] text-[#172234] outline-none placeholder:text-[#788393]"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => send(q)}
            disabled={!memory || typing || !q.trim()}
            aria-label="Send"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#073358] text-white transition-colors hover:bg-[#001F3E] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </motion.button>
        </div>

        <div className="mt-2 text-center text-[11px] text-[#788393]">
          Answers are grounded in your team&apos;s recorded decisions and notes.
        </div>
      </motion.div>
    </main>
  );
}
