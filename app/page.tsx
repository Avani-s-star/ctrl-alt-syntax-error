"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { buildMemory } from "@/lib/client/build";
import { Squiggle, StepArt } from "@/components/Doodles";

/* ---------- schedule engine: forward pass, backward pass, slack ---------- */

type T = {
  id: string;
  name: string;
  dur: number;
  deps: string[];
  color: string;
  ink: string;
  edge: string;
};

const TASKS: T[] = [
  {
    id: "auth",
    name: "Authentication",
    dur: 3,
    deps: [],
    color: "#315B7D",
    ink: "#FFFFFF",
    edge: "#073358",
  },
  {
    id: "login",
    name: "Login page",
    dur: 2,
    deps: ["auth"],
    color: "#7A93AA",
    ink: "#FFFFFF",
    edge: "#315B7D",
  },
  {
    id: "db",
    name: "Database schema",
    dur: 2,
    deps: [],
    color: "#E8EEF2",
    ink: "#172234",
    edge: "#7A93AA",
  },
  {
    id: "dash",
    name: "Dashboard",
    dur: 3,
    deps: ["login", "db"],
    color: "#3D7466",
    ink: "#FFFFFF",
    edge: "#315B7D",
  },
  {
    id: "deploy",
    name: "Deploy",
    dur: 1,
    deps: ["dash"],
    color: "#B85A3A",
    ink: "#FFFFFF",
    edge: "#8B4937",
  },
];

const DAYS = 14;
const ROW = 34;
const H = TASKS.length * ROW - 6;

const idx = (id: string) =>
  TASKS.findIndex((t) => t.id === id);

function schedule(delay: number) {
  const dur = (t: T) =>
    t.dur + (t.id === "auth" ? delay : 0);

  const start: Record<string, number> = {};
  const end: Record<string, number> = {};
  const late: Record<string, number> = {};

  for (const t of TASKS) {
    start[t.id] = Math.max(
      0,
      ...t.deps.map((d) => end[d])
    );

    end[t.id] =
      start[t.id] + dur(t);
  }

  const finish = Math.max(
    ...Object.values(end)
  );

  for (const t of [...TASKS].reverse()) {
    const next = TASKS.filter((x) =>
      x.deps.includes(t.id)
    );

    late[t.id] =
      (next.length
        ? Math.min(
            ...next.map((x) => late[x.id])
          )
        : finish) - dur(t);
  }

  const slack = Object.fromEntries(
    TASKS.map((t) => [
      t.id,
      late[t.id] - start[t.id],
    ])
  );

  return {
    start,
    end,
    finish,
    slack,
  };
}

const BASE = schedule(0);
const S3 = schedule(3);

function workDate(n: number) {
  const d = new Date(2026, 10, 2);
  let c = 1;

  while (c < n) {
    d.setDate(d.getDate() + 1);

    if (d.getDay() % 6 !== 0) {
      c++;
    }
  }

  return d.toLocaleDateString(
    "en-GB",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
    }
  );
}

const dayLabel = (i: number) =>
  workDate(i + 1).replace(/^\w+ /, "");

const hand = {
  fontFamily:
    '"Segoe Script","Bradley Hand","Comic Sans MS",cursive',
};

const changed3 = TASKS.filter(
  (t) =>
    S3.start[t.id] !== BASE.start[t.id] ||
    S3.end[t.id] !== BASE.end[t.id]
);

const crit = (s: typeof BASE) =>
  TASKS
    .filter((t) => s.slack[t.id] === 0)
    .map((t) => t.name);

function Logo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      aria-hidden
    >
      <rect
        x="2"
        y="6"
        width="16"
        height="6"
        rx="3"
        fill="#073358"
      />

      <rect
        x="10"
        y="16"
        width="16"
        height="6"
        rx="3"
        fill="#E8EEF2"
        stroke="#315B7D"
        strokeWidth="1.5"
      />

      <circle
        cx="14"
        cy="14"
        r="2"
        fill="#001F3E"
      />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();

  const [delay, setDelay] =
    useState(3);

  const sim = schedule(delay);

  const changed = TASKS.filter(
    (t) =>
      sim.start[t.id] !== BASE.start[t.id] ||
      sim.end[t.id] !== BASE.end[t.id]
  );

  const moved = changed
    .filter((t) => t.id !== "auth")
    .map((t) => t.name);

  const stayed = TASKS
    .filter(
      (t) =>
        t.id !== "auth" &&
        !changed.includes(t) &&
        sim.slack[t.id] > 0
    )
    .map((t) => t.name);

  const diff =
    sim.finish - BASE.finish;

  const spring = {
    type: "spring" as const,
    stiffness: 140,
    damping: 20,
  };

  const [repo, setRepo] = useState("");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState("");

  // Runs the REAL pipeline: read notes/commits → AI extracts decisions → check → save → show alerts.
  async function openDemo(useRepo?: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    setLog([]);
    document.getElementById("analyze")?.scrollIntoView({ behavior: "smooth", block: "center" });
    try {
      await buildMemory({
        repo: useRepo || undefined,
        onProgress: (msg) => setLog((l) => [...l, msg]),
      });
      router.push("/alerts");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-[#172234]">

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-[#D9E0E6]/80 bg-[#F5F6F4]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-8 px-8 py-3.5">
          <a
            href="#top"
            className="flex items-center gap-2 font-medium text-[#073358]"
          >
            <Logo />
            Project Twin
          </a>

          <nav className="hidden gap-6 text-sm text-[#526071] md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-[#001F3E]"
            >
              Features
            </a>

            <a
              href="#how"
              className="transition-colors hover:text-[#001F3E]"
            >
              How it works
            </a>

            <a
              href="#memory"
              className="transition-colors hover:text-[#001F3E]"
            >
              Team Memory
            </a>
          </nav>

          <div className="ml-auto flex items-center gap-4 text-sm">
            <button
              onClick={() => openDemo()}
              className="rounded-lg bg-[#073358] px-4 py-2 font-medium text-white transition hover:bg-[#001F3E]"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        id="top"
        className="relative mx-auto grid max-w-6xl items-center gap-14 px-8 pb-24 pt-16 lg:grid-cols-[0.85fr_1.15fr]"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#B85A3A]">
            Less guesswork, better planning
          </p>

          <motion.h1
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="mt-4 text-5xl font-black leading-[1.02] tracking-[-0.055em] text-[#001F3E] md:text-[56px]"
          >
            What if your project took a{" "}
            <span className="relative inline-block">
              different turn?

              <Squiggle
                className="absolute -bottom-2 left-0 h-3 w-full"
                color="#B85A3A"
              />
            </span>
          </motion.h1>

          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[#526071]">
            Plans change. People get busy. Priorities shift.
            Project Twin helps you see what happens next,
            before a small change becomes a big problem.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <motion.button
              whileHover={{
                y: -2,
                boxShadow:
                  "0 12px 25px rgba(0,31,62,0.18)",
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => openDemo()}
              className="rounded-lg bg-[#073358] px-6 py-3 font-medium text-white hover:bg-[#001F3E]"
            >
              Explore the demo
            </motion.button>

            <motion.a
              href="#how"
              whileHover={{
                y: -2,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="rounded-lg border border-[#C9D2DC] bg-white/55 px-6 py-3 font-medium text-[#073358] backdrop-blur-sm hover:bg-white/80"
            >
              See how it works
            </motion.a>
          </div>

          {/* ANALYZE A REAL REPO */}
          <div
            id="analyze"
            className="mt-6 max-w-md rounded-xl border border-[#D9E0E6] bg-white/70 p-4 backdrop-blur-sm"
          >
            <p className="text-sm font-medium text-[#073358]">Analyze your own GitHub repo</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (repo.trim()) openDemo(repo.trim());
              }}
              className="mt-2 flex gap-2"
            >
              <input
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="github.com/owner/repo"
                className="min-w-0 flex-1 rounded-lg border border-[#C9D2DC] bg-white px-3 py-2 text-sm text-[#172234]"
              />
              <button
                type="submit"
                disabled={busy || !repo.trim()}
                className="rounded-lg bg-[#B85A3A] px-4 py-2 text-sm font-medium text-white hover:bg-[#8B4937] disabled:opacity-40"
              >
                Analyze
              </button>
            </form>
            {(busy || log.length > 0) && (
              <div className="mt-3 max-h-48 overflow-y-auto font-mono text-xs leading-relaxed text-[#526071]">
                {log.map((l, i) => (
                  <div key={i} className={i === log.length - 1 && busy ? "animate-pulse text-[#073358]" : ""}>
                    {i === log.length - 1 && !busy ? "✓ " : "→ "}
                    {l}
                  </div>
                ))}
              </div>
            )}
            {error && <p className="mt-2 text-xs text-red-600">⚠ {error}</p>}
          </div>
        </div>

        {/* HERO GRAPH */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.985,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            delay: 0.15,
            duration: 0.6,
          }}
          className="rounded-2xl border border-[#D9E0E6] bg-white/90 p-5 shadow-[0_14px_36px_rgba(0,31,62,0.08)] backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#073358]">
                CampusConnect
              </p>

              <p className="text-xs text-[#526071]">
                Starts Mon 2 Nov · scenario, unsaved
              </p>
            </div>

            <div className="flex -space-x-2">
              {[
                ["A", "#F4E7E2"],
                ["R", "#E8EEF2"],
                ["K", "#DCEBE6"],
                ["M", "#EAF0F4"],
              ].map(([l, c]) => (
                <motion.span
                  key={l}
                  whileHover={{
                    y: -3,
                    scale: 1.08,
                  }}
                  style={{
                    background: c,
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-medium text-[#073358]"
                >
                  {l}
                </motion.span>
              ))}
            </div>
          </div>

          <label className="mt-4 block text-sm text-[#526071]">
            Developer unavailable for{" "}
            <b className="font-semibold text-[#172234]">
              {delay} working{" "}
              {delay === 1 ? "day" : "days"}
            </b>

            <input
              type="range"
              min={0}
              max={6}
              value={delay}
              onChange={(e) =>
                setDelay(
                  Number(e.target.value)
                )
              }
              className="mt-2 block w-full accent-[#315B7D]"
            />
          </label>

          <div className="mt-6 grid grid-cols-[7rem_1fr] gap-3">
            <div className="space-y-1.5">
              {TASKS.map((t) => (
                <p
                  key={t.id}
                  className="h-7 truncate text-xs font-medium leading-7 text-[#526071]"
                >
                  {t.name}
                </p>
              ))}
            </div>

            <div>
              <div
                className="relative"
                style={{
                  height: H,
                }}
              >
                {[5, 10].map((i) => (
                  <div
                    key={i}
                    className="absolute inset-y-0 w-px bg-[#E5E8EB]"
                    style={{
                      left: `${(i / DAYS) * 100}%`,
                    }}
                  />
                ))}

                <div
                  className="absolute -top-4 inset-y-0 -translate-x-1/2 text-[10px] text-[#788393]"
                  style={{
                    left: `${(BASE.finish / DAYS) * 100}%`,
                  }}
                >
                  <span className="absolute -top-0 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    deadline
                  </span>

                  <div className="absolute bottom-0 left-1/2 top-4 border-l border-dashed border-[#7A93AA]" />
                </div>

                {/* CURRENT FINISH */}
                <motion.div
                  className="absolute -top-4 bottom-0 w-0.5 bg-[#B85A3A]"
                  animate={{
                    left: `${
                      (sim.finish / DAYS) *
                      100
                    }%`,
                  }}
                  transition={spring}
                >
                  <svg
                    width="14"
                    height="12"
                    viewBox="0 0 14 12"
                    className="absolute left-0 top-0"
                    aria-hidden
                  >
                    <path
                      d="M0 0 H12 L9 4 L12 8 H0Z"
                      fill="#B85A3A"
                    />
                  </svg>
                </motion.div>

                {/* DEPENDENCY LINES */}
                <svg
                  className="absolute inset-0 h-full w-full overflow-visible"
                  viewBox={`0 0 ${DAYS} ${H}`}
                  preserveAspectRatio="none"
                  fill="none"
                  aria-hidden
                >
                  {TASKS.flatMap((t) =>
                    t.deps.map((dep) => {
                      const x1 =
                        sim.end[dep];

                      const y1 =
                        idx(dep) * ROW + 14;

                      const x2 =
                        sim.start[t.id];

                      const y2 =
                        idx(t.id) * ROW + 14;

                      const late =
                        sim.start[t.id] !==
                        BASE.start[t.id];

                      const d = `M ${x1} ${y1} C ${
                        x1 + 0.6
                      } ${y1}, ${
                        x2 - 0.6
                      } ${y2}, ${x2} ${y2}`;

                      return (
                        <motion.path
                          key={
                            dep + t.id
                          }
                          initial={{
                            d,
                          }}
                          animate={{
                            d,
                            stroke: late
                              ? "#B85A3A"
                              : "#7A93AA",
                          }}
                          transition={
                            spring
                          }
                          strokeWidth={1.5}
                          vectorEffect="non-scaling-stroke"
                          strokeLinecap="round"
                        />
                      );
                    })
                  )}
                </svg>

                {/* TASK BARS */}
                {TASKS.map((t, i) => {
                  const moved_ =
                    sim.start[t.id] !==
                      BASE.start[t.id] ||
                    sim.end[t.id] !==
                      BASE.end[t.id];

                  const isCritical =
                    sim.slack[t.id] === 0;

                  return (
                    <div
                      key={t.id}
                    >
                      {/* ORIGINAL POSITION */}
                      {moved_ && (
                        <div
                          className="absolute h-7 rounded border border-dashed border-[#7A93AA] bg-[#E8EEF2]/35"
                          style={{
                            top: i * ROW,
                            left: `${
                              (BASE.start[t.id] /
                                DAYS) *
                              100
                            }%`,
                            width: `${
                              ((BASE.end[t.id] -
                                BASE.start[t.id]) /
                                DAYS) *
                              100
                            }%`,
                          }}
                        />
                      )}

                      <motion.div
                        style={{
                          top: i * ROW,
                          background:
                            t.color,
                          color: t.ink,
                          borderBottomColor:
                            t.edge,
                        }}
                        transition={
                          spring
                        }
                        animate={{
                          left: `${
                            (sim.start[
                              t.id
                            ] /
                              DAYS) *
                            100
                          }%`,

                          width: `${
                            ((sim.end[
                              t.id
                            ] -
                              sim.start[
                                t.id
                              ]) /
                              DAYS) *
                            100
                          }%`,
                        }}
                        className={`absolute flex h-7 items-center justify-between rounded px-2 text-[11px] font-semibold shadow-sm ${
                          isCritical
                            ? "border-b-[3px]"
                            : ""
                        }`}
                      >
                        <span>
                          {sim.end[t.id] -
                            sim.start[t.id]}
                          d
                        </span>

                        {sim.slack[t.id] >
                          0 && (
                          <span className="text-[10px] font-medium opacity-80">
                            slack{" "}
                            {
                              sim.slack[
                                t.id
                              ]
                            }
                            d
                          </span>
                        )}
                      </motion.div>
                    </div>
                  );
                })}

                {/* SLIPPED LABEL */}
                {delay > 0 && (
                  <motion.span
                    style={hand}
                    initial={false}
                    animate={{
                      left: `${
                        (sim.end.auth /
                          DAYS) *
                          100 +
                        1.5
                      }%`,
                    }}
                    transition={spring}
                    className="absolute top-1 whitespace-nowrap text-xs text-[#B85A3A]"
                  >
                    ← slipped +{delay}d
                  </motion.span>
                )}
              </div>

              <div className="relative mt-1 h-4 text-[10px] tabular-nums text-[#788393]">
                {[0, 5, 10].map((i) => (
                  <span
                    key={i}
                    className="absolute"
                    style={{
                      left: `${
                        (i / DAYS) * 100
                      }%`,
                    }}
                  >
                    {dayLabel(i)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-1 text-[11px] text-[#788393]">
            Dark underline = critical path. Dashed outline = original plan.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-[#D9E0E6] pt-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#788393]">
                Original finish
              </p>

              <p className="mt-1 font-medium tabular-nums">
                {workDate(BASE.finish)}
              </p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#788393]">
                New finish
              </p>

              <p
                className={`mt-1 font-medium tabular-nums ${
                  diff > 0
                    ? "text-[#B85A3A]"
                    : ""
                }`}
              >
                {workDate(sim.finish)}
              </p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#788393]">
                Impact
              </p>

              <p className="mt-1 font-medium tabular-nums">
                {diff > 0
                  ? `+${diff} working days`
                  : "No change"}
              </p>

              <p className="text-xs text-[#788393]">
                {changed.length} tasks affected
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-[#526071]">
            {delay === 0 ? (
              "Drag the slider to see what happens when a developer is out."
            ) : (
              <>
                {moved.join(" and ")} depend
                {moved.length === 1
                  ? "s"
                  : ""}{" "}
                on Authentication, so{" "}
                {moved.length === 1
                  ? "it moves"
                  : "they move"}{" "}
                too.{" "}
                {stayed.length > 0 && (
                  <>
                    {stayed.join(", ")} had slack and stays put.
                  </>
                )}
              </>
            )}
          </p>

          <div className="mt-3 border-l-2 border-[#B85A3A] bg-[#F4E7E2]/70 px-3 py-2 text-xs">
            <b className="font-medium">
              Decision note
            </b>{" "}
            · Riya, 2 Sept: “Use Firebase for auth.”
            The code now uses Supabase.
          </div>
        </motion.div>
      </section>

      {/* FEATURES / WHAT IF */}
      <section
        id="features"
        className="relative scroll-mt-24 overflow-hidden bg-transparent"
      >
        <div className="mx-auto max-w-6xl px-8 py-20">
          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            transition={{
              duration: 0.55,
            }}
          >
            <h2 className="max-w-xl text-4xl font-bold tracking-tight text-[#001F3E]">
              Change one thing. See the whole plan respond.
            </h2>

            <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-[#3E4A62]">
              Project Twin knows which tasks depend on each other.
              When one slips, it recalculates only what is affected,
              and tells you why.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <motion.div
              initial={{
                opacity: 0,
                x: -35,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.25,
              }}
              transition={{
                duration: 0.55,
                delay: 0.08,
              }}
              whileHover={{
                y: -4,
                boxShadow:
                  "0 16px 30px rgba(0,31,62,0.10)",
              }}
              className="rounded-lg border border-[#D9E0E6] bg-white/90 p-6 backdrop-blur-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[#788393]">
                Original plan
              </p>

              <p className="mt-2 text-3xl font-semibold tabular-nums text-[#001F3E]">
                {workDate(BASE.finish)}
              </p>

              <p className="mt-4 text-sm text-[#788393]">
                Critical path
              </p>

              <p className="text-sm font-medium text-[#172234]">
                {crit(BASE).join(" → ")}
              </p>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: 35,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.25,
              }}
              transition={{
                duration: 0.55,
                delay: 0.16,
              }}
              whileHover={{
                y: -4,
                boxShadow:
                  "0 16px 30px rgba(184,90,58,0.13)",
              }}
              className="rounded-lg border border-[#D9E0E6] bg-white/90 p-6 backdrop-blur-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[#B85A3A]">
                If a developer is out for 3 days
              </p>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: 0.35,
                  duration: 0.35,
                }}
                className="mt-2 text-3xl font-semibold tabular-nums text-[#B85A3A]"
              >
                {workDate(S3.finish)}
              </motion.p>

              <p className="mt-4 text-sm text-[#788393]">
                {changed3.length} tasks affected
              </p>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: 0.45,
                  duration: 0.35,
                }}
                className="text-sm font-medium text-[#172234]"
              >
                {changed3
                  .map((t) => t.name)
                  .join(", ")}
              </motion.p>

              <p className="mt-3 text-sm text-[#788393]">
                {crit(BASE).join() ===
                crit(S3).join()
                  ? "Critical path unchanged, but it runs longer."
                  : `New critical path: ${crit(S3).join(
                      " → "
                    )}`}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="mx-auto max-w-5xl scroll-mt-24 px-8 pb-24 pt-24"
      >
        <motion.h2
          initial={{
            opacity: 0,
            y: 22,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.5,
          }}
          className="max-w-lg text-4xl font-semibold tracking-tight text-[#001F3E]"
        >
          From a rough plan to a clearer picture.
        </motion.h2>

        <div className="relative mt-14 space-y-16">
          <div
            aria-hidden
            className="absolute bottom-10 left-1/2 top-10 hidden border-l border-dashed border-[#B8C4D2] md:block"
          />

          {[
            {
              n: "01",
              t: "Put the pieces together",
              d: "Add tasks, deadlines, team members, and dependencies. See how the work fits together.",
              bg: "#E8EEF2",
              r: "rounded-[28px_8px_28px_8px]",
            },
            {
              n: "02",
              t: "Try another possibility",
              d: "What happens if a task slips or someone becomes unavailable? Test the change without disturbing the original plan.",
              bg: "#F4E7E2",
              r: "rounded-[8px_28px_8px_28px]",
            },
            {
              n: "03",
              t: "See what changes",
              d: "Understand the new finish date, affected tasks, and changes to the critical path.",
              bg: "#E8F0ED",
              r: "rounded-[28px_28px_8px_28px]",
            },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.25,
              }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
              }}
              className={`relative grid items-center gap-8 md:grid-cols-2 ${
                i === 1
                  ? "md:[&>*:first-child]:order-2"
                  : ""
              }`}
            >
              <div
                className={
                  i === 1
                    ? "md:pl-12"
                    : "md:pr-12"
                }
              >
                <p className="text-sm font-medium text-[#B85A3A]">
                  {s.n}
                </p>

                <h3 className="mt-1 text-2xl font-semibold text-[#001F3E]">
                  {s.t}
                </h3>

                <p className="mt-2 max-w-sm leading-relaxed text-[#526071]">
                  {s.d}
                </p>
              </div>

              <motion.div
                whileHover={{
                  y: -5,
                  scale: 1.015,
                }}
                transition={{
                  duration: 0.2,
                }}
                className={`mx-auto flex h-36 w-full max-w-xs items-center justify-center p-5 shadow-sm ${s.r}`}
                style={{
                  background: s.bg,
                }}
              >
                <StepArt n={s.n} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TEAM MEMORY */}
      <section
        id="memory"
        className="scroll-mt-24 mx-auto grid max-w-6xl items-center gap-12 px-8 py-24 md:grid-cols-[1fr_1.1fr]"
      >
        <motion.div
          initial={{
            opacity: 0,
            x: -30,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.55,
          }}
        >
          <h2 className="text-4xl font-bold tracking-tight text-[#001F3E]">
            Remember why you decided.
          </h2>

          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-[#526071]">
            Team Memory reads your notes, chats, and repository.
            Ask a question, get the decision with its source,
            and see when the code has drifted away from it.
          </p>

          <motion.div
            whileHover={{
              x: 4,
            }}
            transition={{
              duration: 0.18,
            }}
          >
            <Link
              href="/ask"
              className="mt-6 inline-block font-medium text-[#B85A3A] underline underline-offset-4 hover:text-[#8B4937]"
            >
              Try asking it
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            x: 30,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.55,
            delay: 0.12,
          }}
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: 0.25,
              duration: 0.4,
            }}
            className="rounded-full border border-[#D9E0E6] bg-white/90 px-5 py-3 text-[#526071] shadow-sm backdrop-blur-md"
          >
            Why did we choose Firebase?
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 18,
              scale: 0.98,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: 0.35,
              duration: 0.45,
            }}
            whileHover={{
              y: -4,
              boxShadow:
                "0 16px 32px rgba(0,31,62,0.10)",
            }}
            className="mt-4 rounded-xl border border-[#D9E0E6] bg-white/90 p-5 backdrop-blur-md"
          >
            <p className="text-xs text-[#788393]">
              Riya · 2 Sept · Sprint planning notes
            </p>

            <p className="mt-1 text-lg font-semibold text-[#001F3E]">
              Use Firebase for auth
            </p>

            <p className="mt-1 text-sm text-[#526071]">
              Because of the free tier.
            </p>

            <p className="mt-3 text-xs text-[#788393]">
              Related tasks: Authentication, Login page
            </p>

            <motion.p
              initial={{
                opacity: 0,
                x: -8,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.5,
                duration: 0.3,
              }}
              className="mt-3 border-l-2 border-[#B85A3A] bg-[#F4E7E2]/60 px-3 py-2 text-xs"
            >
              The code now uses Supabase, which differs from this decision.
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="bg-[#001F3E] text-white">
        <div className="mx-auto max-w-6xl px-8 py-20">
          <motion.h2
            initial={{
              opacity: 0,
              y: 18,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.45,
            }}
            className="max-w-xl text-4xl font-semibold tracking-tight"
          >
            A little less guessing. A lot more clarity.
          </motion.h2>

          <p className="mt-3 text-[17px] text-[#C9D2DC]">
            Try a change. See the consequences. Keep the original plan safe.
          </p>

          <motion.button
            whileHover={{
              y: -2,
              boxShadow:
                "0 12px 25px rgba(184,90,58,0.25)",
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={() => openDemo()}
            className="mt-8 rounded-lg bg-[#B85A3A] px-6 py-3 font-medium text-white hover:bg-[#8B4937]"
          >
            Start exploring
          </motion.button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#D9E0E6] bg-white/60 px-8 py-8 text-center text-sm text-[#788393] backdrop-blur-md">
        Project Twin · Know what changes before they happen.
      </footer>
    </main>
  );
}