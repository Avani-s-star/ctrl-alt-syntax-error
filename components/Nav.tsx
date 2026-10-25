"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/alerts", label: "Alerts" },
  { href: "/decisions", label: "Decisions" },
  { href: "/ask", label: "Ask" },
  { href: "/whatif", label: "What if?" },
];

function Logo({ cozy }: { cozy: boolean }) {
  const line = cozy ? "#073358" : "#FFFFFF";

  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 7 L13 13 L20 7 M13 13 L13 21"
        stroke={line}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <circle
        cx="6"
        cy="7"
        r="3"
        fill="#DCE7F3"
        stroke={line}
        strokeWidth="1.6"
      />

      <circle
        cx="20"
        cy="7"
        r="3"
        fill="#F3DDD6"
        stroke={line}
        strokeWidth="1.6"
      />

      <circle
        cx="13"
        cy="21"
        r="3"
        fill="#D9E0E8"
        stroke={line}
        strokeWidth="1.6"
      />
    </svg>
  );
}

function LoginModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* BACKDROP */}
      <motion.button
        type="button"
        aria-label="Close login"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#001F3E]/40 backdrop-blur-[7px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* LOGIN WINDOW */}
      <motion.div
        initial={{
          opacity: 0,
          y: 24,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: 12,
          scale: 0.97,
        }}
        transition={{
          duration: 0.32,
          ease: [0.22, 1, 0.36, 1],
        }}
        onClick={(event) => event.stopPropagation()}
        className="relative z-10 w-full max-w-[430px] overflow-hidden rounded-[28px] border border-white/80 bg-[#F7F7F5]/95 shadow-[0_30px_90px_rgba(0,31,62,0.22)] backdrop-blur-2xl"
      >
        {/* SOFT AURORA ACCENTS */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#B87588]/14 blur-[70px]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-10 h-52 w-52 rounded-full bg-[#6F638F]/12 blur-[70px]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute right-8 bottom-[-80px] h-44 w-44 rounded-full bg-[#5C8992]/10 blur-[65px]"
        />

        {/* TOP AURORA LINE */}
        <div className="relative h-1.5 bg-gradient-to-r from-[#315B7D] via-[#7A6B91] via-[#B87588] to-[#B85A3A]" />

        <div className="relative p-7 sm:p-9">
          {/* CLOSE */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-[#788393] transition-all hover:bg-[#E9EBEA] hover:text-[#172234]"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* PROJECT TWIN ICON */}
          <motion.div
            initial={{
              scale: 0.8,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              delay: 0.08,
              duration: 0.3,
            }}
            className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-white/65 shadow-[0_8px_24px_rgba(0,31,62,0.07)] backdrop-blur-md"
          >
            {/* tiny muted color wash */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-[#DCE7F3]/80 via-[#F3DDD6]/45 to-[#E8F0ED]/70"
            />

            <svg
              width="25"
              height="25"
              viewBox="0 0 26 26"
              fill="none"
              className="relative"
            >
              <path
                d="M6 7L13 13L20 7M13 13V21"
                stroke="#315B7D"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              <circle
                cx="6"
                cy="7"
                r="3"
                fill="#DCE7F3"
                stroke="#315B7D"
                strokeWidth="1.5"
              />

              <circle
                cx="20"
                cy="7"
                r="3"
                fill="#F3DDD6"
                stroke="#B87588"
                strokeWidth="1.5"
              />

              <circle
                cx="13"
                cy="21"
                r="3"
                fill="#DCEBE6"
                stroke="#3D7466"
                strokeWidth="1.5"
              />
            </svg>
          </motion.div>

          {/* HEADING */}
          <div className="mt-6">
            <h2 className="text-[30px] font-extrabold tracking-[-0.045em] text-[#001F3E]">
              Welcome back
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#526071]">
              Sign in to continue to your project memory.
            </p>
          </div>

          {/* LOGIN FORM */}
          <form
            className="mt-7 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();

              // Authentication can be connected here later.
            }}
          >
            {/* EMAIL */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-xs font-extrabold text-[#526071]"
              >
                Email
              </label>

              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-[#D9E0E6] bg-white/70 px-4 py-3.5 text-sm text-[#172234] outline-none transition-all placeholder:text-[#9AA3AD] focus:border-[#6A7F91] focus:bg-white/90 focus:ring-4 focus:ring-[#315B7D]/10"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-xs font-extrabold text-[#526071]"
                >
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-bold text-[#7A6381] transition-colors hover:text-[#B85A3A]"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-[#D9E0E6] bg-white/70 px-4 py-3.5 pr-12 text-sm text-[#172234] outline-none transition-all placeholder:text-[#9AA3AD] focus:border-[#6A7F91] focus:bg-white/90 focus:ring-4 focus:ring-[#315B7D]/10"
                />

                {/* SHOW / HIDE PASSWORD */}
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#788393] transition-colors hover:bg-[#E8EEF2] hover:text-[#315B7D]"
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M3 3L21 21"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M10.6 10.6A2 2 0 0013.4 13.4M9.9 4.3A10.5 10.5 0 0112 4c5.5 0 9 5 10 8a17 17 0 01-3.1 4.8M6.2 6.2C3.9 7.8 2.5 10.3 2 12c1 3 4.5 8 10 8 1.7 0 3.2-.4 4.5-1.1"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />

                      <circle
                        cx="12"
                        cy="12"
                        r="2.7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <motion.button
              type="submit"
              whileHover={{
                y: -1,
                boxShadow:
                  "0 12px 28px rgba(7,51,88,0.20)",
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="w-full rounded-xl bg-[#073358] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(7,51,88,0.13)] transition-colors hover:bg-[#001F3E]"
            >
              Log in
            </motion.button>
          </form>

          {/* DIVIDER */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#D9E0E6]" />

            <span className="text-[11px] font-semibold text-[#8A949F]">
              OR
            </span>

            <div className="h-px flex-1 bg-[#D9E0E6]" />
          </div>

          {/* GOOGLE */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#D9E0E6] bg-white/65 px-5 py-3.5 text-sm font-bold text-[#526071] transition-all hover:border-[#B9C4CF] hover:bg-white/90"
          >
            <span className="text-base font-extrabold text-[#526071]">
              G
            </span>

            Continue with Google
          </button>

          {/* SIGN UP */}
          <p className="mt-6 text-center text-xs text-[#788393]">
            Don't have an account?{" "}
            <button
              type="button"
              className="font-extrabold text-[#7A6381] transition-colors hover:text-[#B85A3A]"
            >
              Create one
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Nav({
  cozy,
}: {
  cozy: boolean;
}) {
  const path = usePathname();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{
          y: -30,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
        }}
        className={`sticky top-0 z-50 border-b backdrop-blur ${
          cozy
            ? "border-[#D9D9D7] bg-[#F5F6F4]/90"
            : "border-white/10 bg-[#001F3E]/95"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-1 px-8 py-3">
          {/* LOGO */}
          <Link
            href="/"
            className={`mr-6 flex items-center gap-2 text-lg font-semibold ${
              cozy
                ? "text-[#001F3E]"
                : "text-white"
            }`}
          >
            <Logo cozy={cozy} />
            Project Twin
          </Link>

          {/* NAVIGATION */}
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative px-3 py-1.5 text-sm ${
                cozy
                  ? "text-[#526071] hover:text-[#001F3E]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {path === l.href && (
                <motion.span
                  layoutId="pill"
                  className={`absolute inset-0 rounded-full ${
                    cozy
                      ? "bg-[#DCE7F3]"
                      : "bg-white/10"
                  }`}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 32,
                  }}
                />
              )}

              <span className="relative">
                {l.label}
              </span>
            </Link>
          ))}

          {/* LOGIN */}
          <motion.button
            type="button"
            onClick={() => setLoginOpen(true)}
            whileHover={{
              y: -1,
            }}
            whileTap={{
              scale: 0.97,
            }}
            className={`ml-auto mr-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              cozy
                ? "text-[#073358] hover:bg-[#E8EDF2]"
                : "text-white/85 hover:bg-white/10 hover:text-white"
            }`}
          >
            Login
          </motion.button>

          {/* TRY THE DEMO */}
          <Link
            href="/alerts"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              cozy
                ? "bg-[#073358] text-white hover:bg-[#001F3E]"
                : "bg-[#C24D2C] text-white hover:bg-[#A83F23]"
            }`}
          >
            Try the demo
          </Link>
        </div>
      </motion.nav>

      {/* LOGIN MODAL */}
      <AnimatePresence>
        {loginOpen && (
          <LoginModal
            onClose={() => setLoginOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}