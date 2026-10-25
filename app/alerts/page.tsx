
"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemory } from "@/lib/client/useMemory";

const pageEase = [0.22, 1, 0.36, 1] as const;

function Counter({ to }: { to: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 700;

    const update = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(to * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(update);
      }
    };

    frame = requestAnimationFrame(update);

    return () => cancelAnimationFrame(frame);
  }, [to]);

  return <>{value}</>;
}

function Radar({ count }: { count: number }) {
  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center sm:h-32 sm:w-32">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{
            scale: [0.4, 1.15],
            opacity: [0.55, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i,
            ease: "easeOut",
          }}
          className="absolute inset-0 rounded-full border border-[#7A93AA]"
        />
      ))}

      <motion.div
        animate={{
          boxShadow: [
            "0 0 0 rgba(7,51,88,0)",
            "0 0 22px rgba(7,51,88,0.12)",
            "0 0 0 rgba(7,51,88,0)",
          ],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#E7EDF2] text-xl font-bold text-[#073358] sm:h-16 sm:w-16 sm:text-2xl"
      >
        {count}
      </motion.div>
    </div>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: "high" | "medium" | "low";
}) {
  const styles = {
    high: "border-[#E3C2B8] bg-[#F4E7E2] text-[#8B4937]",
    medium: "border-[#D6DDE5] bg-[#EAF0F4] text-[#315B7D]",
    low: "border-[#D5E3DD] bg-[#E8F0ED] text-[#315B50]",
  };

  const labels = {
    high: "High impact",
    medium: "Medium impact",
    low: "Low impact",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles[severity]}`}
    >
      {labels[severity]}
    </span>
  );
}

function StatusBadge({ resolved }: { resolved: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        resolved
          ? "border-[#D5E3DD] bg-[#E8F0ED] text-[#315B50]"
          : "border-[#E3C2B8] bg-[#F4E7E2] text-[#8B4937]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          resolved ? "bg-[#3D7466]" : "bg-[#B85A3A]"
        }`}
      />

      {resolved ? "Resolved" : "Open"}
    </span>
  );
}

export default function Alerts() {
  const memory = useMemory();

  /*
   * Stores:
   * {
   *   "alert-id": "You"
   * }
   *
   * This lets us remember WHO resolved each alert
   * instead of only remembering whether it was resolved.
   */
  const [resolved, setResolved] = useState<Record<string, string>>({});

  const [asked, setAsked] = useState<string[]>([]);
  const [fixOpen, setFixOpen] = useState<string[]>([]);
  const [filter, setFilter] = useState<
    "all" | "open" | "resolved"
  >("all");
  const [toast, setToast] = useState("");

  // Real results from the pipeline: one card per contradiction (not per decision).
  const alerts = useMemo(() => {
    if (!memory) return [];
    const byId = new Map(memory.decisions.map((d) => [d.id, d]));
    const docTitle = (id?: string) => memory.docs.find((x) => x.id === id)?.title ?? id ?? "";

    return memory.contradictions.map((c) => {
      const d = byId.get(c.decisionId);
      const [first, second, ...rest] = c.evidence;
      const isCode = c.kind === "code";
      return {
        id: c.id,
        title: isCode
          ? "A recorded decision no longer matches the code"
          : "Two team decisions contradict each other",
        description: c.explanation,
        severity: (isCode ? "high" : "medium") as "high" | "medium" | "low",
        evidence: isCode
          ? [second, ...rest].filter(Boolean).map((e) => `${e.label}: ${e.snippet}`).join("   •   ")
          : `Source: ${docTitle(d?.sourceId)}`,
        recorded: first ? `${first.snippet} (${first.label})` : "Previous team decision",
        difference: second
          ? isCode
            ? `Code now uses: ${second.snippet}`
            : `${second.snippet} (${second.label})`
          : "This may differ from the current implementation.",
        fix: isCode
          ? `Either record a new decision explaining why the team switched, or bring the code back in line with: "${d?.what ?? first?.snippet}".`
          : "Ask the people involved which decision stands, then record it so the team stops getting conflicting guidance.",
        author: d?.who ?? "Team Memory",
      };
    });
  }, [memory]);

  const displayAlerts =
    memory
      ? alerts
      : [
          {
            id: "supabase-alert",
            title: "Database choice may have changed",
            description:
              "The current implementation appears to rely on a database decision made earlier in the project.",
            severity: "high" as const,
            evidence:
              "The original project context references Supabase for persistence and authentication.",
            difference:
              "The current implementation may be using a different data layer or configuration.",
            fix:
              "Check the current database configuration and make sure Supabase credentials, schema and queries match the original decision.",
            author: "Team Memory",
          },
          {
            id: "auth-alert",
            title: "Authentication flow needs attention",
            description:
              "A previous authentication decision may no longer match the current project flow.",
            severity: "medium" as const,
            evidence:
              "The project history contains an earlier authentication decision.",
            difference:
              "The current authentication flow differs from the recorded approach.",
            fix:
              "Compare the current auth flow with the recorded decision and update either the implementation or the decision record.",
            author: "Team Memory",
          },
          {
            id: "api-alert",
            title: "API behaviour changed",
            description:
              "A recorded API assumption may no longer match the current implementation.",
            severity: "medium" as const,
            evidence:
              "Previous project context contains an API-related decision.",
            difference:
              "Current API behaviour appears different from the recorded expectation.",
            fix:
              "Review the endpoint contract, request payload and response handling before changing dependent code.",
            author: "Team Memory",
          },
        ];

  const openCount = displayAlerts.filter(
    (alert) => !resolved[alert.id]
  ).length;

  const resolvedCount = displayAlerts.filter(
    (alert) => Boolean(resolved[alert.id])
  ).length;

  const filteredAlerts = displayAlerts.filter((alert) => {
    if (filter === "open") {
      return !resolved[alert.id];
    }

    if (filter === "resolved") {
      return Boolean(resolved[alert.id]);
    }

    return true;
  });

  /*
   * Resolve / reopen alert.
   *
   * For now the resolver is "You".
   * This can later be replaced with the
   * authenticated user's actual name.
   */
  const resolveAlert = (id: string) => {
    const alreadyResolved = Boolean(resolved[id]);

    setResolved((current) => {
      const next = { ...current };

      if (alreadyResolved) {
        delete next[id];
      } else {
        next[id] = "You";
      }

      return next;
    });

    setToast(
      alreadyResolved
        ? "Alert reopened"
        : "Alert marked as resolved"
    );
  };

  const toggleFix = (id: string) => {
    setFixOpen((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const askAbout = (id: string) => {
    setAsked((current) =>
      current.includes(id)
        ? current
        : [...current, id]
    );

    setToast("Question added to Ask");
  };

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast("");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* =========================================================
          HEADER
      ========================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: pageEase,
        }}
        className="mb-7"
      >
        <div className="flex items-center justify-between gap-6">
          <div className="max-w-3xl">
            <motion.div
              initial={{
                opacity: 0,
                x: -7,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.05,
                duration: 0.4,
              }}
              className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#416B91]"
            >
              Project Memory / Alerts
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 7,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1,
                duration: 0.45,
              }}
              className="font-[var(--font-jakarta)] text-3xl font-bold tracking-[-0.035em] text-[#001F3E] sm:text-4xl"
            >
              Decisions that need your attention
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.18,
                duration: 0.45,
              }}
              className="mt-2 max-w-2xl text-[14px] leading-6 text-[#526071]"
            >
              Team Memory watches for places where your current
              project appears to diverge from decisions your team
              made earlier.
            </motion.p>
          </div>

          <Radar count={openCount} />
        </div>
      </motion.section>

      {/* =========================================================
          STATS
      ========================================================= */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.07,
            },
          },
        }}
        className="mb-6 grid grid-cols-3 border-y border-[#D9E0E6] bg-white"
      >
        {[
          {
            label: "Total alerts",
            value: displayAlerts.length,
            color: "#315B7D",
          },
          {
            label: "Open",
            value: openCount,
            color: "#B85A3A",
          },
          {
            label: "Resolved",
            value: resolvedCount,
            color: "#3D7466",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={{
              hidden: {
                opacity: 0,
                y: 8,
              },
              show: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.4,
                  ease: pageEase,
                },
              },
            }}
            className={`relative px-4 py-3.5 sm:px-6 ${
              index !== 0
                ? "border-l border-[#D9E0E6]"
                : ""
            }`}
          >
            <div
              className="absolute left-0 top-0 h-full w-[2px]"
              style={{
                background: stat.color,
              }}
            />

            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#788393]">
              {stat.label}
            </div>

            <div className="mt-0.5 text-xl font-bold text-[#172234]">
              <Counter to={stat.value} />
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* =========================================================
          FILTERS
      ========================================================= */}
      <motion.section
        initial={{
          opacity: 0,
          y: 7,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.2,
          duration: 0.4,
          ease: pageEase,
        }}
        className="mb-6 flex justify-end"
      >
        <div className="flex items-center gap-1 border border-[#D9E0E6] bg-white p-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-[#073358] text-white"
                : "text-[#526071] hover:bg-[#EEF3F7] hover:text-[#172234]"
            }`}
          >
            All
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilter("open")}
            className={`px-4 py-2 text-xs font-semibold transition-all ${
              filter === "open"
                ? "bg-[#B85A3A] text-white"
                : "text-[#526071] hover:bg-[#F5ECE8] hover:text-[#633D31]"
            }`}
          >
            Open
            <span className="ml-1 opacity-75">
              {openCount}
            </span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilter("resolved")}
            className={`px-4 py-2 text-xs font-semibold transition-all ${
              filter === "resolved"
                ? "bg-[#3D7466] text-white"
                : "text-[#526071] hover:bg-[#E8F0ED] hover:text-[#315B50]"
            }`}
          >
            Resolved
            <span className="ml-1 opacity-75">
              {resolvedCount}
            </span>
          </motion.button>
        </div>
      </motion.section>

      {/* =========================================================
          ALERTS
      ========================================================= */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
        className="space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredAlerts.map((alert) => {
            const isResolved = Boolean(
              resolved[alert.id]
            );

            const resolvedBy = resolved[alert.id];

            const isFixOpen = fixOpen.includes(
              alert.id
            );

            const hasAsked = asked.includes(
              alert.id
            );

            return (
              <motion.article
                layout
                key={alert.id}
                initial={{
                  opacity: 0,
                  y: 12,
                  scale: 0.99,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                  scale: 0.985,
                }}
                transition={{
                  duration: 0.4,
                  ease: pageEase,
                }}
                whileHover={{
                  y: -1,
                  transition: {
                    duration: 0.2,
                  },
                }}
                className={`overflow-hidden border bg-white shadow-[0_6px_20px_rgba(0,31,62,0.045)] ${
                  isResolved
                    ? "border-[#D7E2DD]"
                    : "border-[#D9E0E6]"
                }`}
              >
                {/* ACCENT */}
                <motion.div
                  initial={{
                    scaleX: 0,
                  }}
                  animate={{
                    scaleX: 1,
                  }}
                  transition={{
                    duration: 0.55,
                    ease: pageEase,
                  }}
                  className={`h-[3px] origin-left ${
                    isResolved
                      ? "bg-[#3D7466]"
                      : alert.severity === "high"
                        ? "bg-[#B85A3A]"
                        : "bg-[#416B91]"
                  }`}
                />

                <div className="p-5 sm:p-6">
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0">
                      <div className="mb-2.5 flex flex-wrap items-center gap-2">
                        <SeverityBadge
                          severity={alert.severity}
                        />

                        <StatusBadge
                          resolved={isResolved}
                        />
                      </div>

                      <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#172234] sm:text-[22px]">
                        {alert.title}
                      </h2>

                      <p className="mt-1.5 max-w-3xl text-[14px] leading-6 text-[#526071]">
                        {alert.description}
                      </p>

                      {/* RESOLVED BY */}
                      <AnimatePresence>
                        {isResolved &&
                          resolvedBy && (
                            <motion.div
                              initial={{
                                opacity: 0,
                                y: 4,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              exit={{
                                opacity: 0,
                                y: -3,
                              }}
                              transition={{
                                duration: 0.25,
                              }}
                              className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#788393]"
                            >
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E8F0ED] text-[9px] font-bold text-[#3D7466]">
                                ✓
                              </span>

                              <span>
                                Resolved by{" "}
                                <span className="font-semibold text-[#315B50]">
                                  {resolvedBy}
                                </span>
                              </span>
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </div>

                    {/* AUTHOR */}
                    <div className="hidden shrink-0 items-center gap-2 sm:flex">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8EEF2] text-[10px] font-bold text-[#315B7D]">
                        {alert.author
                          .split(" ")
                          .map(
                            (word: string) =>
                              word[0]
                          )
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold text-[#172234]">
                          {alert.author}
                        </div>

                        <div className="text-[10px] text-[#788393]">
                          Project context
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EVIDENCE */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: -6,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: 0.14,
                      duration: 0.35,
                    }}
                    className="mt-5 border-l-[3px] border-[#7A93AA] pl-4"
                  >
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#315B7D]">
                      Evidence
                    </div>

                    <p className="text-[13px] leading-6 text-[#172234]">
                      {alert.evidence}
                    </p>
                  </motion.div>

                  {/* WHAT CHANGED */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.2,
                      duration: 0.35,
                    }}
                    className="mt-5 border-t border-[#E5E8EB] pt-4"
                  >
                    <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#526071]">
                      What changed
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                      <div>
                        <div className="mb-1 text-[11px] font-semibold text-[#788393]">
                          Recorded
                        </div>

                        <p className="text-[13px] leading-5 text-[#172234]">
                          {"recorded" in alert ? alert.recorded : "Previous team decision"}
                        </p>
                      </div>

                      <div className="hidden text-[#9AA4AF] sm:block">
                        →
                      </div>

                      <div>
                        <div className="mb-1 text-[11px] font-semibold text-[#788393]">
                          Current
                        </div>

                        <p className="text-[13px] leading-5 text-[#172234]">
                          {alert.difference}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* ACTIONS */}
                  <div className="mt-5 flex flex-col gap-3 border-t border-[#E5E8EB] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <motion.button
                      whileHover={{
                        x: 2,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      onClick={() =>
                        toggleFix(alert.id)
                      }
                      className="group flex items-center gap-2 text-sm font-semibold text-[#073358]"
                    >
                      <motion.span
                        animate={{
                          rotate: isFixOpen
                            ? 45
                            : 0,
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8EEF2] text-[#073358] transition-colors group-hover:bg-[#DCE6ED]"
                      >
                        +
                      </motion.span>

                      <span>How to fix</span>
                    </motion.button>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{
                          y: -1,
                        }}
                        whileTap={{
                          scale: 0.98,
                        }}
                        onClick={() =>
                          askAbout(alert.id)
                        }
                        className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all ${
                          hasAsked
                            ? "border-[#D5E3DD] bg-[#E8F0ED] text-[#315B50]"
                            : "border-[#D6DEE5] bg-white text-[#172234] hover:bg-[#F3F5F6]"
                        }`}
                      >
                        {hasAsked
                          ? "Added to Ask"
                          : "Ask about this"}
                      </motion.button>

                      <motion.button
                        whileHover={{
                          y: -1,
                        }}
                        whileTap={{
                          scale: 0.98,
                        }}
                        onClick={() =>
                          resolveAlert(alert.id)
                        }
                        className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                          isResolved
                            ? "bg-[#E8F0ED] text-[#315B50] hover:bg-[#DCE9E4]"
                            : "bg-[#073358] text-white shadow-[0_4px_10px_rgba(7,51,88,0.12)] hover:bg-[#0A416C]"
                        }`}
                      >
                        {isResolved
                          ? "Reopen"
                          : "Mark resolved"}
                      </motion.button>
                    </div>
                  </div>

                  {/* HOW TO FIX */}
                  <AnimatePresence initial={false}>
                    {isFixOpen && (
                      <motion.div
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.3,
                          ease: pageEase,
                        }}
                        className="overflow-hidden"
                      >
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: -6,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: -6,
                          }}
                          className="mt-4 border-l-[3px] border-[#315B7D] bg-[#F3F6F8] px-4 py-3.5"
                        >
                          <h3 className="text-sm font-semibold text-[#172234]">
                            How to fix
                          </h3>

                          <p className="mt-1.5 text-[13px] leading-6 text-[#172234]">
                            {alert.fix}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold text-[#172234]">
                              Project context
                            </span>

                            <span className="text-[#9AA4AF]">
                              •
                            </span>

                            <span className="font-semibold text-[#172234]">
                              Supabase
                            </span>

                            <span className="text-[#9AA4AF]">
                              •
                            </span>

                            <span className="font-semibold text-[#172234]">
                              API
                            </span>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>

        {/* EMPTY STATE */}
        {filteredAlerts.length === 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="border border-[#D9E0E6] bg-white px-6 py-12 text-center"
          >
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F0ED] text-[#315B50]">
              ✓
            </div>

            <h3 className="mt-3 text-lg font-bold text-[#172234]">
              Nothing here
            </h3>

            <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-[#788393]">
              There are no alerts matching this filter
              right now.
            </p>
          </motion.div>
        )}
      </motion.section>

      {/* =========================================================
          RESOLUTION PROGRESS
      ========================================================= */}
      <motion.section
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.3,
          duration: 0.4,
          ease: pageEase,
        }}
        className="mt-6 border-t border-[#D9E0E6] pt-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-[#172234]">
              Alert resolution
            </div>

            <div className="mt-0.5 text-xs text-[#788393]">
              {resolvedCount} of{" "}
              {displayAlerts.length} resolved
            </div>
          </div>

          <div className="text-sm font-bold text-[#073358]">
            {displayAlerts.length
              ? Math.round(
                  (resolvedCount /
                    displayAlerts.length) *
                    100
                )
              : 100}
            %
          </div>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden bg-[#E7EBEE]">
          <motion.div
            initial={{
              width: 0,
            }}
            animate={{
              width: `${
                displayAlerts.length
                  ? (resolvedCount /
                      displayAlerts.length) *
                    100
                  : 100
              }%`,
            }}
            transition={{
              duration: 0.8,
              ease: pageEase,
            }}
            className="h-full bg-[#315B7D]"
          />
        </div>
      </motion.section>

      {/* =========================================================
          TOAST
      ========================================================= */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 10,
              scale: 0.97,
            }}
            transition={{
              duration: 0.25,
              ease: pageEase,
            }}
            className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 bg-[#073358] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,31,62,0.2)]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}