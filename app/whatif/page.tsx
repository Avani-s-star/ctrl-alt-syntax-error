"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMemory } from "@/lib/client/useMemory";
import { mockTasks } from "@/lib/client/mock";
import { projectDays } from "@/lib/sim/cpm";
import Counter from "@/components/Counter";

const CARD_W = 170;
const CARD_H = 76;
const GAP_X = 56;
const GAP_Y = 24;

const levels: Record<string, number> = {};

const levelOf = (id: string): number => {
  if (levels[id] !== undefined) return levels[id];

  const task = mockTasks.find((x) => x.id === id)!;

  return (levels[id] = Math.max(-1, ...task.deps.map(levelOf)) + 1);
};

mockTasks.forEach((task) => levelOf(task.id));

const rowCount: Record<number, number> = {};
const pos: Record<string, { x: number; y: number }> = {};

mockTasks.forEach((task) => {
  const level = levels[task.id];
  const row = rowCount[level] ?? 0;

  rowCount[level] = row + 1;

  pos[task.id] = {
    x: level * (CARD_W + GAP_X),
    y: row * (CARD_H + GAP_Y),
  };
});

const maxLevel = Math.max(...Object.values(levels));
const maxRows = Math.max(...Object.values(rowCount));

const W = (maxLevel + 1) * CARD_W + maxLevel * GAP_X;

const H = maxRows * CARD_H + (maxRows - 1) * GAP_Y;

const pageEase = [0.22, 1, 0.36, 1] as const;

/* =========================================================
   GRAPH COLOUR SYSTEM
   Same accent family as Alerts / Project Twin
========================================================= */

const GRAPH = {
  blue: "#416B91",
  blueBright: "#206ABC",
  violet: "#7C5CFC",
  green: "#3D7466",
  cyan: "#2E9FB3",
  yellow: "#D6A72C",
  red: "#B85A3A",
  terracotta: "#C24D2C",

  navy: "#073358",
  navyDeep: "#001F3E",

  graphBg: "#071A2B",
  graphCard: "#0D263B",
  graphCardActive: "#281E1A",

  grid: "rgba(120,146,173,0.055)",
  muted: "#8196AA",
  mutedDark: "#617A8F",
  border: "#29465E",
};

export default function WhatIf() {
  const memory = useMemory();

  const [selected, setSelected] = useState("");
  const [rework, setRework] = useState(50);

  const before = projectDays(mockTasks);

  const result = useMemo(() => {
    const decision = memory?.decisions.find(
      (x) => x.id === selected
    );

    if (!decision) return null;

    const entities = decision.entities.map((e) =>
      e.toLowerCase()
    );

    const hit = new Set(
      mockTasks
        .filter((task) =>
          task.entities.some((e) =>
            entities.includes(e.toLowerCase())
          )
        )
        .map((task) => task.id)
    );

    let grew = true;

    while (grew) {
      grew = false;

      for (const task of mockTasks) {
        if (
          !hit.has(task.id) &&
          task.deps.some((dep) => hit.has(dep))
        ) {
          hit.add(task.id);
          grew = true;
        }
      }
    }

    const redone = mockTasks.map((task) =>
      hit.has(task.id)
        ? {
            ...task,
            est: Math.ceil(
              task.est * (1 + rework / 100)
            ),
          }
        : task
    );

    return {
      hit,
      redone,
      after: projectDays(redone),
    };
  }, [memory, selected, rework]);

  const selectedDecision = memory?.decisions.find(
    (x) => x.id === selected
  );

  const daysAdded = result
    ? result.after - before
    : 0;

  const affectedPercentage = result
    ? Math.round(
        (result.hit.size / mockTasks.length) * 100
      )
    : 0;

  if (!memory) {
    return (
      <main className="min-h-screen bg-transparent px-6 py-12">
        <p className="text-sm text-[#526071]">
          Loading…
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent">

      <div className="mx-auto w-full max-w-[1380px] px-5 py-8 sm:px-7 lg:px-9 lg:py-10">

        {/* =========================================================
            HEADER
        ========================================================= */}

        <motion.header
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            ease: pageEase,
          }}
          className="mb-8"
        >
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

            <div className="max-w-3xl">

              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[#C24D2C]" />

                <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#C24D2C]">
                  Project simulation
                </span>
              </div>

              <h1 className="font-[var(--font-jakarta)] text-[2.7rem] font-extrabold leading-[1.02] tracking-[-0.05em] text-[#001F3E] sm:text-[3.5rem] lg:text-[4rem]">
                What if a decision
                <br />
                changed everything?
              </h1>

              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#526071]">
                Reverse a team decision and watch the consequence
                move through your project's dependency graph.
              </p>

            </div>

            {/* CURRENT SIMULATION STATE */}

            <motion.div
              initial={{
                opacity: 0,
                x: 12,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.12,
                duration: 0.4,
                ease: pageEase,
              }}
              className="flex shrink-0 items-center gap-3 border border-[#D5DCE1] bg-white/90 px-4 py-3 shadow-[0_8px_24px_rgba(0,31,62,0.05)] backdrop-blur"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  selected
                    ? "bg-[#C24D2C] shadow-[0_0_10px_rgba(194,77,44,0.55)]"
                    : "bg-[#9CA8B2]"
                }`}
              />

              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#788393]">
                  Simulation
                </p>

                <p className="mt-0.5 text-xs font-semibold text-[#172234]">
                  {selected
                    ? "Scenario active"
                    : "Waiting for decision"}
                </p>
              </div>
            </motion.div>

          </div>
        </motion.header>

        {/* =========================================================
            SCENARIO BUILDER
        ========================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.08,
            duration: 0.45,
            ease: pageEase,
          }}
          className="overflow-hidden border border-[#D5DCE1] bg-white/95 shadow-[0_10px_35px_rgba(0,31,62,0.06)] backdrop-blur"
        >

          <div className="flex flex-col justify-between gap-4 border-b border-[#E1E5E8] px-5 py-5 sm:px-7 lg:flex-row lg:items-center">

            <div className="flex items-start gap-4">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#073358] text-xs font-bold text-white">
                01
              </div>

              <div>
                <h2 className="text-sm font-bold text-[#172234]">
                  Build your scenario
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#788393]">
                  Choose a decision and estimate the amount of
                  rework it would introduce.
                </p>
              </div>

            </div>

            {selectedDecision && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="border-l-2 border-[#C24D2C] bg-[#F8F2F0] px-4 py-2.5"
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#A0442F]">
                  Reversing
                </p>

                <p className="mt-0.5 max-w-[360px] truncate text-xs font-semibold text-[#172234]">
                  {selectedDecision.what}
                </p>
              </motion.div>
            )}

          </div>

          <div className="grid lg:grid-cols-[1fr_350px]">

            {/* DECISION SELECTION */}

            <div className="px-5 py-6 sm:px-7">

              <div className="mb-4 flex items-center justify-between">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#788393]">
                    Reverse a decision
                  </p>

                  <p className="mt-1 text-xs text-[#526071]">
                    Select one from your team's memory.
                  </p>
                </div>

                <span className="text-[10px] font-semibold text-[#9AA4AD]">
                  {memory.decisions.length} available
                </span>

              </div>

              <div className="grid gap-2 sm:grid-cols-2">

                {memory.decisions.map((decision, index) => {

                  const active =
                    selected === decision.id;

                  return (
                    <motion.button
                      key={decision.id}
                      type="button"
                      onClick={() =>
                        setSelected(
                          active
                            ? ""
                            : decision.id
                        )
                      }
                      whileHover={{
                        y: -2,
                      }}
                      whileTap={{
                        scale: 0.985,
                      }}
                      transition={{
                        duration: 0.16,
                      }}
                      className={`group relative flex min-h-[74px] items-start gap-3 border p-4 text-left transition-all duration-200 ${
                        active
                          ? "border-[#073358] bg-[#073358] shadow-[0_8px_22px_rgba(0,31,62,0.14)]"
                          : "border-[#D8DEE3] bg-[#FAFBFB] hover:border-[#9EADB8] hover:bg-white"
                      }`}
                      style={{
                        animationDelay: `${index * 35}ms`,
                      }}
                    >

                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border ${
                          active
                            ? "border-[#E8EEF2] bg-[#E8EEF2]"
                            : "border-[#B8C3CB] bg-white"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            active
                              ? "bg-[#C24D2C]"
                              : "bg-[#A8B2BA] group-hover:bg-[#315B7D]"
                          }`}
                        />
                      </span>

                      <div className="min-w-0">

                        <p
                          className={`text-[10px] font-bold uppercase tracking-[0.1em] ${
                            active
                              ? "text-[#AFC1D1]"
                              : "text-[#8A96A0]"
                          }`}
                        >
                          {decision.date}
                        </p>

                        <p
                          className={`mt-1 text-xs font-semibold leading-5 ${
                            active
                              ? "text-white"
                              : "text-[#172234]"
                          }`}
                        >
                          {decision.what}
                        </p>

                      </div>

                      {active && (
                        <motion.span
                          layoutId="selectedIndicator"
                          className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-[#C24D2C] shadow-[0_0_10px_rgba(194,77,44,0.5)]"
                        />
                      )}

                    </motion.button>
                  );
                })}

              </div>
            </div>

            {/* REWORK CONTROL */}

            <div className="border-t border-[#E1E5E8] bg-[#F7F9FA]/95 px-5 py-6 sm:px-7 lg:border-l lg:border-t-0">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#788393]">
                    Rework multiplier
                  </p>

                  <p className="mt-1 max-w-[220px] text-xs leading-5 text-[#526071]">
                    How much additional effort should affected
                    tasks require?
                  </p>
                </div>

                <motion.div
                  key={rework}
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className="text-right"
                >
                  <span className="block text-2xl font-bold tracking-[-0.04em] text-[#C24D2C]">
                    +{rework}%
                  </span>

                  <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#9AA4AD]">
                    per task
                  </span>
                </motion.div>

              </div>

              <div className="mt-8">

                <input
                  type="range"
                  min={20}
                  max={100}
                  step={10}
                  value={rework}
                  onChange={(e) =>
                    setRework(
                      Number(e.target.value)
                    )
                  }
                  className="w-full accent-[#C24D2C]"
                />

                <div className="mt-2 flex justify-between text-[9px] font-semibold text-[#9AA4AD]">
                  <span>+20%</span>
                  <span>+60%</span>
                  <span>+100%</span>
                </div>

              </div>

              <div className="mt-7 border-t border-[#DCE2E6] pt-5">

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#788393]">
                    Current project
                  </span>

                  <span className="text-sm font-bold text-[#172234]">
                    {before} days
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-[#788393]">
                    Affected tasks
                  </span>

                  <span className="text-sm font-bold text-[#416B91]">
                    {result
                      ? `${result.hit.size}/${mockTasks.length}`
                      : "—"}
                  </span>
                </div>

              </div>

            </div>
          </div>
        </motion.section>

        {/* =========================================================
            IMPACT SUMMARY
        ========================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.16,
            duration: 0.4,
            ease: pageEase,
          }}
          className="mt-5 grid grid-cols-2 border-y border-[#D8DEE3] bg-white/95 backdrop-blur sm:grid-cols-4"
        >

          <div className="border-r border-[#E1E5E8] px-5 py-4 sm:px-6">

            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#8A96A0]">
              Baseline
            </p>

            <p className="mt-1 text-xl font-bold tracking-[-0.03em] text-[#073358]">
              {before}
              <span className="ml-1 text-xs font-medium text-[#788393]">
                days
              </span>
            </p>

          </div>

          <div className="border-b border-[#E1E5E8] px-5 py-4 sm:border-b-0 sm:border-r sm:px-6">

            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#8A96A0]">
              New estimate
            </p>

            <p className="mt-1 text-xl font-bold tracking-[-0.03em] text-[#172234]">
              {result ? result.after : "—"}

              {result && (
                <span className="ml-1 text-xs font-medium text-[#788393]">
                  days
                </span>
              )}
            </p>

          </div>

          <div className="border-r border-[#E1E5E8] px-5 py-4 sm:px-6">

            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#8A96A0]">
              Schedule impact
            </p>

            <p
              className={`mt-1 text-xl font-bold tracking-[-0.03em] ${
                result
                  ? "text-[#C24D2C]"
                  : "text-[#9AA4AD]"
              }`}
            >
              {result ? `+${daysAdded}` : "—"}

              {result && (
                <span className="ml-1 text-xs font-medium">
                  days
                </span>
              )}
            </p>

          </div>

          <div className="px-5 py-4 sm:px-6">

            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#8A96A0]">
              Project affected
            </p>

            <p className="mt-1 text-xl font-bold tracking-[-0.03em] text-[#416B91]">
              {result ? `${affectedPercentage}%` : "—"}
            </p>

          </div>

        </motion.section>

        {/* =========================================================
            DEPENDENCY GRAPH
        ========================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
            duration: 0.5,
            ease: pageEase,
          }}
          className="mt-7 overflow-hidden border border-[#203B53] bg-[#071A2B] shadow-[0_24px_70px_rgba(0,31,62,0.18)]"
        >

          {/* GRAPH HEADER */}

          <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] px-5 py-5 sm:px-7 lg:flex-row lg:items-center">

            <div className="flex items-start gap-4">

              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center text-xs font-bold text-white"
                style={{
                  background:
                    `linear-gradient(135deg, ${GRAPH.blueBright}, ${GRAPH.violet})`,
                }}
              >
                02
              </div>

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-sm font-bold text-[#F5F6F4]">
                    Dependency map
                  </h2>

                  <span className="h-1 w-1 rounded-full bg-[#526F86]" />

                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#8196AA]">
                    Live model
                  </span>

                </div>

                <p className="mt-1 text-xs text-[#8196AA]">
                  Follow the consequence from the selected decision
                  through the project.
                </p>

              </div>
            </div>

            <div className="flex items-center gap-3">

              <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#6F879B]">
                {result
                  ? `${result.hit.size} affected`
                  : "No scenario"}
              </span>

              <motion.span
                animate={
                  result
                    ? {
                        scale: [1, 1.35, 1],
                        opacity: [1, 0.65, 1],
                      }
                    : {}
                }
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  repeatDelay: 0.8,
                }}
                className={`h-2 w-2 rounded-full ${
                  result
                    ? "bg-[#C24D2C] shadow-[0_0_12px_rgba(194,77,44,0.65)]"
                    : "bg-[#61788B]"
                }`}
              />

            </div>
          </div>

          {/* GRAPH */}

          <div className="overflow-x-auto p-5 sm:p-7">

            <div
              className="relative"
              style={{
                width: W,
                minWidth: W,
                height: H + 44,
              }}
            >

              {/* STAGE LABELS */}

              <div className="absolute left-0 top-0 flex">

                {Array.from({
                  length: maxLevel + 1,
                }).map((_, level) => (

                  <div
                    key={level}
                    style={{
                      width: CARD_W + GAP_X,
                    }}
                    className="flex items-center gap-2"
                  >

                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.13em]"
                      style={{
                        color:
                          [
                            GRAPH.blueBright,
                            GRAPH.violet,
                            GRAPH.cyan,
                            GRAPH.green,
                            GRAPH.yellow,
                          ][level % 5],
                      }}
                    >
                      Stage {String(level + 1).padStart(2, "0")}
                    </span>

                    <span
                      className="h-px w-7"
                      style={{
                        background:
                          [
                            GRAPH.blueBright,
                            GRAPH.violet,
                            GRAPH.cyan,
                            GRAPH.green,
                            GRAPH.yellow,
                          ][level % 5],
                      }}
                    />

                  </div>
                ))}

              </div>

              <div
                className="absolute left-0 top-[28px]"
                style={{
                  width: W,
                  height: H,
                }}
              >

                {/* GRID */}

                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    backgroundImage: `
                      linear-gradient(
                        ${GRAPH.grid} 1px,
                        transparent 1px
                      ),
                      linear-gradient(
                        90deg,
                        ${GRAPH.grid} 1px,
                        transparent 1px
                      )
                    `,
                    backgroundSize:
                      "28px 28px",
                  }}
                />

                {/* GRAPH COLOUR GLOW */}

                <div
                  className="pointer-events-none absolute inset-0 rounded-xl"
                  style={{
                    background: `
                      radial-gradient(
                        circle at 18% 30%,
                        rgba(32,106,188,0.13),
                        transparent 28%
                      ),
                      radial-gradient(
                        circle at 48% 55%,
                        rgba(124,92,252,0.11),
                        transparent 30%
                      ),
                      radial-gradient(
                        circle at 80% 40%,
                        rgba(46,159,179,0.10),
                        transparent 28%
                      ),
                      radial-gradient(
                        circle at 65% 85%,
                        rgba(61,116,102,0.08),
                        transparent 25%
                      )
                    `,
                  }}
                />

                {/* SVG CONNECTIONS */}

                <svg
                  width={W}
                  height={H}
                  className="absolute inset-0 overflow-visible"
                  style={{
                    zIndex: 1,
                  }}
                >

                  <defs>

                    {/* NORMAL */}

                    <marker
                      id="normalArrow"
                      markerWidth="7"
                      markerHeight="7"
                      refX="6"
                      refY="3.5"
                      orient="auto"
                    >
                      <path
                        d="M0,0 L7,3.5 L0,7"
                        fill="none"
                        stroke={GRAPH.blue}
                        strokeWidth="1.5"
                      />
                    </marker>

                    {/* ACTIVE */}

                    <marker
                      id="activeArrow"
                      markerWidth="7"
                      markerHeight="7"
                      refX="6"
                      refY="3.5"
                      orient="auto"
                    >
                      <path
                        d="M0,0 L7,3.5 L0,7"
                        fill="none"
                        stroke={GRAPH.terracotta}
                        strokeWidth="1.5"
                      />
                    </marker>

                    {/* GLOW */}

                    <filter
                      id="activeGlow"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feGaussianBlur
                        stdDeviation="3"
                        result="blur"
                      />

                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                  </defs>

                  {mockTasks.flatMap((task) =>
                    task.deps.map((dep) => {

                      const a = pos[dep];
                      const b = pos[task.id];

                      const x1 =
                        a.x + CARD_W;

                      const y1 =
                        a.y + CARD_H / 2;

                      const x2 =
                        b.x - 2;

                      const y2 =
                        b.y + CARD_H / 2;

                      const active =
                        !!result &&
                        result.hit.has(dep) &&
                        result.hit.has(task.id);

                      const path = `
                        M ${x1} ${y1}
                        C ${x1 + 25} ${y1},
                          ${x2 - 25} ${y2},
                          ${x2} ${y2}
                      `;

                      /*
                        Give untouched connections a subtle
                        colour based on the destination stage.
                      */

                      const destinationLevel =
                        levels[task.id];

                      const normalColors = [
                        GRAPH.blue,
                        GRAPH.violet,
                        GRAPH.cyan,
                        GRAPH.green,
                        GRAPH.yellow,
                      ];

                      const normalColor =
                        normalColors[
                          destinationLevel %
                            normalColors.length
                        ];

                      return (
                        <motion.path
                          key={`${dep}-${task.id}`}
                          d={path}
                          fill="none"
                          stroke={
                            active
                              ? GRAPH.terracotta
                              : normalColor
                          }
                          strokeWidth={
                            active ? 2.8 : 1.6
                          }
                          strokeLinecap="round"
                          markerEnd={
                            active
                              ? "url(#activeArrow)"
                              : "url(#normalArrow)"
                          }
                          filter={
                            active
                              ? "url(#activeGlow)"
                              : undefined
                          }
                          initial={{
                            opacity: 0,
                            pathLength: 0,
                          }}
                          animate={{
                            opacity: active
                              ? 1
                              : 0.7,
                            pathLength: 1,
                          }}
                          transition={{
                            duration: 0.55,
                            ease: "easeOut",
                          }}
                        />
                      );
                    })
                  )}

                </svg>

                {/* TASK NODES */}

                {mockTasks.map((task, index) => {

                  const affected =
                    !!result?.hit.has(task.id);

                  const newEst =
                    result?.redone.find(
                      (x) =>
                        x.id === task.id
                    )?.est ?? task.est;

                  /*
                    Stable colour assignment so the graph
                    feels like one designed system rather
                    than every node being the same colour.
                  */

                  const nodeColors = [
                    GRAPH.blueBright,
                    GRAPH.violet,
                    GRAPH.cyan,
                    GRAPH.green,
                    GRAPH.yellow,
                  ];

                  const nodeAccent =
                    nodeColors[
                      index % nodeColors.length
                    ];

                  return (
                    <motion.div
                      key={task.id}
                      initial={{
                        opacity: 0,
                        scale: 0.88,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.32,
                        delay: 0.04 * index,
                        ease: pageEase,
                      }}
                      whileHover={{
                        y: -4,
                        scale: 1.025,
                      }}
                      className="absolute"
                      style={{
                        left: pos[task.id].x,
                        top: pos[task.id].y,
                        width: CARD_W,
                        height: CARD_H,
                        zIndex: 2,
                      }}
                    >

                      {/* OUTER COLOUR BORDER */}

                      <div
                        className="h-full w-full rounded-[13px] border p-px"
                        style={{
                          borderColor: affected
                            ? GRAPH.terracotta
                            : nodeAccent,
                          background: affected
                            ? GRAPH.terracotta
                            : nodeAccent,
                          boxShadow: affected
                            ? "0 0 25px rgba(194,77,44,0.28)"
                            : `0 0 18px ${nodeAccent}22`,
                        }}
                      >

                        <motion.div
                          animate={
                            affected
                              ? {
                                  boxShadow: [
                                    "0 0 0 rgba(194,77,44,0)",
                                    "0 0 24px rgba(194,77,44,0.24)",
                                    "0 0 0 rgba(194,77,44,0)",
                                  ],
                                }
                              : {
                                  boxShadow: [
                                    `0 0 0 ${nodeAccent}00`,
                                    `0 0 14px ${nodeAccent}25`,
                                    `0 0 0 ${nodeAccent}00`,
                                  ],
                                }
                          }
                          transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            repeatDelay: 1.2,
                          }}
                          className={`relative flex h-full w-full flex-col justify-between rounded-[12px] px-3.5 py-3 ${
                            affected
                              ? "bg-[#281E1A]"
                              : "bg-[#0D263B]"
                          }`}
                        >

                          {/* TOP ACCENT */}

                          <div
                            className="absolute left-3 right-3 top-0 h-[2px] rounded-full"
                            style={{
                              background: affected
                                ? GRAPH.terracotta
                                : nodeAccent,
                              boxShadow: affected
                                ? "0 0 8px rgba(194,77,44,0.5)"
                                : `0 0 8px ${nodeAccent}55`,
                            }}
                          />

                          <p className="truncate pt-1 text-[12px] font-bold text-[#F5F6F4]">
                            {task.title}
                          </p>

                          <div className="flex items-center justify-between">

                            <span
                              className="text-[10px] font-semibold"
                              style={{
                                color: affected
                                  ? "#E47A5E"
                                  : nodeAccent,
                              }}
                            >
                              {affected ? (
                                <>
                                  <s className="mr-1 text-[#61788B]">
                                    {task.est}d
                                  </s>

                                  → {newEst}d
                                </>
                              ) : (
                                `${task.est} days`
                              )}
                            </span>

                            {affected && (
                              <span
                                className="text-[8px] font-extrabold uppercase tracking-[0.1em]"
                                style={{
                                  color:
                                    GRAPH.terracotta,
                                }}
                              >
                                changed
                              </span>
                            )}

                          </div>

                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}

              </div>
            </div>
          </div>

          {/* LEGEND */}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.07] px-5 py-4 text-[10px] font-semibold text-[#71889B] sm:px-7">

            <span className="flex items-center gap-2">
              <span
                className="h-[2px] w-5"
                style={{
                  background: GRAPH.blueBright,
                }}
              />
              Dependency
            </span>

            <span className="flex items-center gap-2">
              <span
                className="h-[3px] w-5"
                style={{
                  background: GRAPH.terracotta,
                  boxShadow:
                    "0 0 7px rgba(194,77,44,0.35)",
                }}
              />
              Affected path
            </span>

            <span className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: GRAPH.violet,
                  boxShadow:
                    "0 0 7px rgba(124,92,252,0.5)",
                }}
              />
              Active stage
            </span>

            <span className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: GRAPH.green,
                }}
              />
              Stable task
            </span>

            <span className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: GRAPH.cyan,
                }}
              />
              Dependency stage
            </span>

            <span className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: GRAPH.yellow,
                }}
              />
              Warning
            </span>

          </div>
        </motion.section>

        {/* =========================================================
            CONSEQUENCE PANEL
        ========================================================= */}

        {result ? (

          <motion.section
            key={`${selected}-${rework}`}
            initial={{
              opacity: 0,
              y: 16,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
              ease: pageEase,
            }}
            className="mt-6 grid overflow-hidden border border-[#D5DCE1] bg-white/95 shadow-[0_10px_35px_rgba(0,31,62,0.06)] backdrop-blur lg:grid-cols-[1.1fr_1fr]"
          >

            {/* MAIN RESULT */}

            <div className="border-b border-[#E1E5E8] px-6 py-7 sm:px-8 lg:border-b-0 lg:border-r">

              <div className="flex items-center gap-3">

                <span className="flex h-8 w-8 items-center justify-center bg-[#F3DDD6] text-[10px] font-extrabold text-[#A0442F]">
                  03
                </span>

                <div>

                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#A0442F]">
                    Consequence
                  </p>

                  <p className="mt-0.5 text-xs text-[#788393]">
                    Estimated project schedule after reversal.
                  </p>

                </div>

              </div>

              <div className="mt-7 flex items-end gap-5">

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#8A96A0]">
                    Before
                  </p>

                  <p className="mt-1 text-3xl font-bold tracking-[-0.04em] text-[#073358]">
                    {before}

                    <span className="ml-1 text-xs font-medium text-[#788393]">
                      days
                    </span>
                  </p>

                </div>

                <div className="pb-2 text-xl text-[#9AA4AD]">
                  →
                </div>

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#A0442F]">
                    After
                  </p>

                  <p className="mt-1 text-3xl font-bold tracking-[-0.04em] text-[#C24D2C]">

                    <Counter
                      from={before}
                      to={result.after}
                    />

                    <span className="ml-1 text-xs font-medium">
                      days
                    </span>

                  </p>

                </div>

                <div className="mb-1 border-l border-[#D9DEE2] pl-5">

                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#8A96A0]">
                    Delay
                  </p>

                  <p className="mt-1 text-xl font-bold text-[#C24D2C]">
                    +{daysAdded}d
                  </p>

                </div>

              </div>
            </div>

            {/* AFFECTED TASKS */}

            <div className="px-6 py-7 sm:px-8">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#416B91]">
                    Impacted work
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#172234]">
                    {result.hit.size} of{" "}
                    {mockTasks.length} tasks affected
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-xl font-bold text-[#416B91]">
                    {affectedPercentage}%
                  </p>

                </div>

              </div>

              <div className="mt-5 space-y-2">

                {mockTasks
                  .filter((task) =>
                    result.hit.has(task.id)
                  )
                  .map((task, index) => (

                    <motion.div
                      key={task.id}
                      initial={{
                        opacity: 0,
                        x: -8,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: index * 0.045,
                        duration: 0.25,
                      }}
                      className="flex items-center justify-between border-b border-[#E8ECEF] py-2"
                    >

                      <div className="flex min-w-0 items-center gap-2.5">

                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{
                            background:
                              [
                                GRAPH.blueBright,
                                GRAPH.violet,
                                GRAPH.cyan,
                                GRAPH.green,
                              ][index % 4],
                          }}
                        />

                        <span className="truncate text-xs font-medium text-[#526071]">
                          {task.title}
                        </span>

                      </div>

                      <span className="ml-3 shrink-0 text-[10px] font-bold text-[#C24D2C]">
                        +{Math.ceil(
                          task.est *
                            (rework / 100)
                        )}d
                      </span>

                    </motion.div>
                  ))}

                {result.hit.size === 0 && (
                  <div className="border border-[#DCE3E7] bg-[#F5F8F9] px-4 py-3 text-xs text-[#526071]">
                    Nothing depends on this decision.
                  </div>
                )}

              </div>

            </div>

          </motion.section>

        ) : (

          <motion.section
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.3,
              duration: 0.4,
            }}
            className="mt-6 flex items-center gap-4 border border-dashed border-[#C9D2D9] bg-white/70 px-6 py-5 backdrop-blur"
          >

            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#E8EEF2] text-[10px] font-bold text-[#416B91]">
              03
            </div>

            <div>

              <p className="text-xs font-bold text-[#172234]">
                Your consequence will appear here
              </p>

              <p className="mt-0.5 text-xs text-[#788393]">
                Select a decision above to simulate its impact
                on the project.
              </p>

            </div>

          </motion.section>

        )}

      </div>
    </main>
  );
}