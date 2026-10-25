"use client";
import { usePathname } from "next/navigation";
import Nav from "./Nav";
import Aurora from "./Aurora";

// Pages already redesigned in the cozy light style. Add a route here when you reskin it.
const COZY = ["/", "/alerts", "/decisions", "/ask", "/whatif"];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const cozy = COZY.includes(path);
  return (
    <div className={cozy ? "min-h-screen bg-[#F7F5EF] text-[#292F29]" : "text-white"}>
      {!cozy && <Aurora />}
      {path !== "/" && <Nav cozy={cozy} />}
      {children}
    </div>
  );
}
