"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemory } from "@/lib/client/useMemory";
import Avatar from "@/components/Avatar";
import Counter from "@/components/Counter";

const pageEase = [0.22, 1, 0.36, 1] as const;

const badge: Record<string, string> = {
  active: "bg-[#E1ECE8] text-[#35665A]",
  superseded: "bg-[#E8EBEE] text-[#5C6875]",
  contradicted: "bg-[#F3DDD6] text-[#9E442E]",
};

const statStyles = {
  Decisions: {
    value: "text-[#073358]",
    label: "text-[#526071]",
  },
  Active: {
    value: "text-[#35665A]",
    label: "text-[#526071]",
  },
  Contradicted: {
    value: "text-[#A0442F]",
    label: "text-[#526071]",
  },
  "Team members": {
    value: "text-[#315B7D]",
    label: "text-[#526071]",
  },
};

export default function Decisions() {
  const memory = useMemory();
  const [filter, setFilter] = useState("all");

  if (!memory) {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm text-[#526071]">Loading...</p>
      </main>
    );
  }

  const all = [...memory.decisions].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const people = Array.from(new Set(all.map((d) => d.who)));

  const shown =
    filter === "all"
      ? all
      : all.filter((d) => d.status === filter || d.who === filter);

  const stats = [
    {
      label: "Decisions",
      value: all.length,
    },
    {
      label: "Active",
      value: all.filter((d) => d.status === "active").length,
    },
    {
      label: "Contradicted",
      value: all.filter((d) => d.status === "contradicted").length,
    },
    {
      label: "Team members",
      value: people.length,
    },
  ];

  const chips = ["all", "active", "superseded", "contradicted", ...people];

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: pageEase }}
        className="max-w-3xl"
      >
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-7 bg-[#C24D2C]" />

          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C24D2C]">
            Team memory
          </span>
        </div>

        <h1 className="page-title-small">
          What your team decided
        </h1>

        <p className="page-subtitle mt-3 max-w-2xl">
          Every decision, who made it, and whether it still holds.
        </p>
      </motion.header>

      {/* Statistics */}
      <section className="mt-8 border-y border-[#D9DEE2] bg-white/70">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat, index) => {
            const style = statStyles[
              stat.label as keyof typeof statStyles
            ];

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.08 * index,
                  duration: 0.4,
                  ease: pageEase,
                }}
                className={`px-5 py-5 sm:px-6 ${
                  index < stats.length - 1
                    ? "border-b border-[#D9DEE2] md:border-b-0 md:border-r"
                    : ""
                } ${
                  index === 2
                    ? "md:border-l-0"
                    : ""
                }`}
              >
                <p
                  className={`text-3xl font-semibold tracking-[-0.03em] ${style.value}`}
                >
                  <Counter
                    from={0}
                    to={stat.value}
                    duration={450}
                  />
                </p>

                <p className={`mt-1 text-xs font-medium ${style.label}`}>
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Filters */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.28,
          duration: 0.45,
          ease: pageEase,
        }}
        className="mt-7"
      >
        <div className="flex flex-col gap-3 border-b border-[#D9DEE2] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#172234]">
              Filter decisions
            </p>
            <p className="mt-0.5 text-xs text-[#788393]">
              View by status or decision owner.
            </p>
          </div>

          <p className="text-xs font-medium text-[#788393]">
            {shown.length} {shown.length === 1 ? "decision" : "decisions"}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip, index) => {
            const selected = filter === chip;

            return (
              <motion.button
                key={chip}
                type="button"
                onClick={() => setFilter(chip)}
                aria-pressed={selected}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.03 * index,
                  duration: 0.25,
                }}
                className={`border px-3.5 py-1.5 text-xs font-semibold capitalize transition-all duration-200 ${
                  selected
                    ? "border-[#073358] bg-[#073358] text-white shadow-sm"
                    : "border-[#D4DADE] bg-white text-[#526071] hover:border-[#9DAAB5] hover:bg-[#F3F6F8] hover:text-[#172234]"
                }`}
              >
                {chip}
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* Decisions */}
      <section className="mt-7">
        <AnimatePresence mode="popLayout">
          {shown.map((decision, index) => {
            const doc = memory.docs.find(
              (document) => document.id === decision.sourceId
            );

            return (
              <motion.article
                key={decision.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: -8,
                  transition: { duration: 0.2 },
                }}
                transition={{
                  delay: Math.min(index * 0.04, 0.25),
                  duration: 0.4,
                  ease: pageEase,
                }}
                whileHover={{ backgroundColor: "#FBFCFC" }}
                className={`group relative border-b border-[#D9DEE2] bg-white/70 px-1 py-6 transition-colors duration-200 sm:px-3 ${
                  decision.status === "contradicted"
                    ? "border-l-[3px] border-l-[#C24D2C] pl-3 sm:pl-5"
                    : "border-l-[3px] border-l-transparent pl-3 sm:pl-5"
                }`}
              >
                <div className="flex gap-4 sm:gap-5">
                  {/* Person */}
                  <div className="shrink-0 pt-0.5">
                    <Avatar
                      name={decision.who}
                      size={42}
                    />
                  </div>

                  {/* Main content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-xs font-semibold text-[#172234]">
                        {decision.who}
                      </p>

                      <span className="text-[#A2ABB4]">·</span>

                      <p className="text-xs text-[#788393]">
                        decided {decision.date}
                      </p>
                    </div>

                    <h2 className="mt-2 max-w-4xl text-lg font-semibold tracking-[-0.02em] text-[#172234] sm:text-xl">
                      {decision.what}
                    </h2>

                    <p className="mt-2 max-w-4xl text-sm leading-6 text-[#526071]">
                      <span className="font-semibold text-[#3E4A62]">
                        Because:
                      </span>{" "}
                      {decision.why}
                    </p>

                    {/* Metadata */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${
                          badge[decision.status] ??
                          "bg-[#E8EBEE] text-[#5C6875]"
                        }`}
                      >
                        {decision.status}
                      </span>

                      {decision.entities.map((entity) => (
                        <span
                          key={entity}
                          className="code border border-[#D7E0E5] bg-[#F2F5F7] px-2.5 py-1 text-[11px] font-medium text-[#315B7D]"
                        >
                          {entity}
                        </span>
                      ))}

                      {doc && (
                        <span className="text-[11px] text-[#788393] sm:ml-2">
                          Source:{" "}
                          <span className="font-medium text-[#526071]">
                            {doc.title}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {shown.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-y border-[#D9DEE2] bg-white/70 px-6 py-12 text-center"
          >
            <div className="mx-auto flex h-10 w-10 items-center justify-center border border-[#D4DADE] bg-[#F3F6F8] text-sm font-semibold text-[#315B7D]">
              —
            </div>

            <p className="mt-4 text-sm font-semibold text-[#172234]">
              No decisions found
            </p>

            <p className="mt-1 text-sm text-[#788393]">
              No decisions match the selected filter.
            </p>
          </motion.div>
        )}
      </section>
    </main>
  );
}