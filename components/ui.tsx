import Link from "next/link";
// PERSON 1 OWNS components/. Tiny UI kit (swap for shadcn/ui later if you want).
import type { Decision } from "@/types/schema";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-stone-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

export function Button({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

const statusStyle: Record<Decision["status"], string> = {
  active: "bg-emerald-100 text-emerald-800",
  superseded: "bg-stone-200 text-stone-600",
  contradicted: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: Decision["status"] }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[status]}`}>{status}</span>;
}

export function Empty() {
  return (
    <Card className="text-center text-stone-500">
      No memory built yet. Go to <Link href="/" className="underline">Connect</Link> and load a project.
    </Card>
  );
}
