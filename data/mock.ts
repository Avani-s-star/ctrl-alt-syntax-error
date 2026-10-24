// OFFLINE MODE: what the LLM is expected to return for the demo docs.
// Used when there is no ANTHROPIC_API_KEY, so the UI works tonight and as a demo-day backup.
import type { Decision } from "@/types/schema";

type D = Omit<Decision, "id" | "sourceId" | "status">;

export const MOCK_DECISIONS: Record<string, D[]> = {
  "note-1": [
    { what: "Use Firebase Authentication for auth", why: "free tier is enough and Google login is easy", who: "Riya", date: "2026-07-02", entities: ["Firebase", "auth"] },
    { what: "Use MongoDB Atlas as the database", why: "Kabir has used it and the schema will change a lot", who: "team", date: "2026-07-02", entities: ["MongoDB", "database"] },
    { what: "Use Redux Toolkit for frontend state management", why: "lots of shared state", who: "team", date: "2026-07-02", entities: ["Redux", "state management"] },
    { what: "MVP deadline is October 1", why: "show it at the start of the semester", who: "team", date: "2026-07-02", entities: ["MVP deadline"] },
  ],
  "note-2": [
    { what: "Use Chart.js for analytics dashboard charts", why: "Meera already knows it", who: "Meera", date: "2026-07-15", entities: ["Chart.js", "dashboard"] },
    { what: "Use CSS Modules for styling", why: "simple, no extra dependencies", who: "Meera, Kabir", date: "2026-07-15", entities: ["CSS Modules", "styling"] },
    { what: "All list APIs must be paginated at 20 items per page", why: "keep the groups page fast at scale", who: "Meera, Kabir", date: "2026-07-15", entities: ["pagination", "list APIs"] },
    { what: "Meera owns the analytics dashboard", why: "", who: "Meera, Kabir", date: "2026-07-15", entities: ["dashboard", "ownership"] },
  ],
  "note-3": [
    { what: "Users sign up with email and password, Google sign-in optional", why: "", who: "Riya", date: "2026-08-01", entities: ["auth", "passwords", "Google sign-in"] },
    { what: "Riya owns everything auth-related", why: "", who: "Riya", date: "2026-08-01", entities: ["auth", "ownership"] },
    { what: "Session length is 7 days", why: "", who: "Riya", date: "2026-08-01", entities: ["sessions"] },
  ],
  "chat-1": [
    { what: "Replace CSS Modules with Tailwind for styling", why: "CSS Modules got painful for dashboard layouts", who: "Meera, Kabir, Riya", date: "2026-08-20", entities: ["Tailwind", "CSS Modules", "styling"] },
  ],
  "note-4": [
    { what: "MVP deadline moved from October 1 to November 15", why: "mid-sem exams clash with the old date", who: "team", date: "2026-09-05", entities: ["MVP deadline"] },
    { what: "Kabir finishes the study groups API this sprint", why: "", who: "team", date: "2026-09-05", entities: ["groups API"] },
    { what: "Notifications stay in the MVP, owned by Riya", why: "", who: "team", date: "2026-09-05", entities: ["notifications"] },
  ],
  "chat-2": [
    { what: "Groups list returns all groups in one response with no pagination, filtered on the client", why: "simpler", who: "Kabir, Meera", date: "2026-09-12", entities: ["pagination", "groups list"] },
  ],
  "note-5": [
    { what: "Login is Google sign-in only; no passwords are stored", why: "less security risk", who: "Meera, Kabir", date: "2026-09-20", entities: ["auth", "Google sign-in", "passwords"] },
  ],
  "note-6": [
    { what: "All user passwords must be hashed with bcrypt, minimum 8 characters", why: "security before launch", who: "Riya", date: "2026-10-02", entities: ["passwords", "bcrypt", "security"] },
    { what: "Rate-limit the login endpoint to 5 attempts per minute", why: "", who: "Riya", date: "2026-10-02", entities: ["login rate limit", "security"] },
    { what: "Use HTTPS everywhere", why: "", who: "Riya", date: "2026-10-02", entities: ["HTTPS", "security"] },
  ],
};

// Expected judge verdicts, keyed "olderId|newerId". Anything not listed = unrelated.
export const MOCK_RELATIONS: Record<string, { relation: "supersedes" | "contradicts"; reason: string }> = {
  "note-2-1|chat-1-0": { relation: "supersedes", reason: "The team explicitly agreed to replace CSS Modules with Tailwind." },
  "note-1-3|note-4-0": { relation: "supersedes", reason: "The deadline was knowingly moved to November 15." },
  "note-3-0|note-5-0": { relation: "supersedes", reason: "Google-only login replaces the email + password design." },
  "note-2-2|chat-2-0": {
    relation: "contradicts",
    reason: "The rule says every list API must be paginated, but the groups list was shipped returning everything with no pagination.",
  },
  "note-5-0|note-6-0": {
    relation: "contradicts",
    reason: "The design review decided no passwords would be stored, but the security checklist requires hashing user passwords.",
  },
};
