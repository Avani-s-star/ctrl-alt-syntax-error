"use client";
// PERSON 1 OWNS components/.
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Connect" },
  { href: "/alerts", label: "Alerts" },
  { href: "/decisions", label: "Decisions" },
  { href: "/ask", label: "Ask" },
  { href: "/impact", label: "What if?" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-3">
        <span className="mr-4 shrink-0 font-semibold tracking-tight">🧠 Team Memory</span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`shrink-0 rounded-md px-3 py-1.5 text-sm ${
              path === l.href ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
