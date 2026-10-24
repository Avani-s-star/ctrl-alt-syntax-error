// PERSON 2 OWNS THIS FILE.
// A fake team ("StudySync", an app for college study groups) with planted contradictions.
// The answer key is in data/ANSWER_KEY.md. Keep them in sync if you edit anything here.
import type { SourceDoc, Task } from "@/types/schema";

export const DEMO_DOCS: SourceDoc[] = [
  {
    id: "note-1",
    type: "note",
    title: "Kickoff meeting",
    date: "2026-07-02",
    author: "Riya",
    text: `StudySync kickoff — attendees: Riya, Kabir, Meera.
Agreed:
- Auth: we'll use Firebase Authentication. Free tier is enough and Google login is one line. (Riya)
- Database: MongoDB Atlas, because Kabir has used it before and the schema will change a lot early on.
- State management on the frontend: Redux Toolkit, since the app will have a lot of shared state (groups, sessions, chat).
- MVP deadline: October 1, so we can show it at the start of the semester.
Open question: do we need a mobile app? (not decided)`,
  },
  {
    id: "note-2",
    type: "note",
    title: "Frontend sync",
    date: "2026-07-15",
    author: "Meera",
    text: `Frontend sync (Meera, Kabir)
- Charts on the analytics dashboard will use Chart.js. Meera already knows it.
- Styling: CSS Modules, keep it simple, no extra dependencies.
- Rule for all list APIs: responses must be paginated, 20 items per page, so the groups page stays fast when we have thousands of groups.
- Meera owns the dashboard.`,
  },
  {
    id: "note-3",
    type: "note",
    title: "Auth design",
    date: "2026-08-01",
    author: "Riya",
    text: `Auth design (Riya)
Users sign up with email + password. Google sign-in as an optional extra.
Riya owns everything auth-related.
Session length: 7 days.`,
  },
  {
    id: "chat-1",
    type: "chat",
    title: "#frontend chat",
    date: "2026-08-20",
    author: "Meera",
    text: `[2026-08-20 18:02] Meera: CSS modules are getting painful for the dashboard layouts
[2026-08-20 18:03] Kabir: switch to tailwind?
[2026-08-20 18:05] Meera: ok — we're replacing CSS Modules with Tailwind from now on, I'll migrate the existing pages this week
[2026-08-20 18:05] Riya: 👍 agreed`,
  },
  {
    id: "note-4",
    type: "note",
    title: "Sprint planning #4",
    date: "2026-09-05",
    author: "Kabir",
    text: `Sprint planning (all)
- Mid-sem exams clash with the old date, so the MVP deadline moves from October 1 to November 15. Everyone agreed.
- Kabir to finish the study groups API this sprint.
- Notifications pushed to after MVP? No — keep them in, Riya will do them.`,
  },
  {
    id: "chat-2",
    type: "chat",
    title: "#backend chat",
    date: "2026-09-12",
    author: "Kabir",
    text: `[2026-09-12 23:10] Kabir: for the groups list page I'm just going to return all groups in one response, no pagination, and filter on the client. way simpler.
[2026-09-12 23:12] Meera: fine by me
[2026-09-12 23:12] Kabir: cool, shipping it like that`,
  },
  {
    id: "note-5",
    type: "note",
    title: "Design review",
    date: "2026-09-20",
    author: "Meera",
    text: `Design review (Meera, Kabir)
- Login screen: Google sign-in only. We decided we're not storing any passwords at all — less security risk for us.
- Dashboard colors finalised.`,
  },
  {
    id: "note-6",
    type: "note",
    title: "Security checklist",
    date: "2026-10-02",
    author: "Riya",
    text: `Security checklist before launch (Riya)
- All user passwords must be hashed with bcrypt, minimum 8 characters, rate-limit the login endpoint to 5 attempts/min.
- HTTPS everywhere.
- Owner: Riya.`,
  },
  // Commits are used as EVIDENCE, not as a source of decisions.
  {
    id: "commit-a1f3",
    type: "commit",
    title: "migrate auth to supabase, firebase quota kept running out",
    date: "2026-08-28",
    author: "Kabir",
    text: "migrate auth to supabase, firebase quota kept running out",
  },
  {
    id: "commit-b72c",
    type: "commit",
    title: "replace mongo with postgres via prisma",
    date: "2026-08-30",
    author: "Kabir",
    text: "replace mongo with postgres via prisma",
  },
  {
    id: "commit-c019",
    type: "commit",
    title: "add zustand store, redux boilerplate was too much",
    date: "2026-09-08",
    author: "Meera",
    text: "add zustand store, redux boilerplate was too much",
  },
  {
    id: "commit-d55e",
    type: "commit",
    title: "dashboard charts with recharts",
    date: "2026-09-25",
    author: "Meera",
    text: "dashboard charts with recharts",
  },
];

// The "codebase": what StudySync's package.json actually contains today.
export const DEMO_PACKAGE_JSON = {
  name: "studysync",
  dependencies: {
    next: "16.0.0",
    react: "19.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@prisma/client": "^6.0.0",
    zustand: "^5.0.0",
    recharts: "^2.12.0",
    bcryptjs: "^2.4.3",
  },
  devDependencies: {
    tailwindcss: "^4.0.0",
    prisma: "^6.0.0",
    typescript: "^5.0.0",
  },
};

// Project plan (in GitHub mode these come from Issues).
export const DEMO_TASKS: Task[] = [
  { id: "t1", title: "Set up authentication", assignee: "Riya", est: 3, deps: [], entities: ["auth", "Firebase"] },
  { id: "t2", title: "Database schema", assignee: "Kabir", est: 2, deps: [], entities: ["database", "MongoDB"] },
  { id: "t3", title: "User profiles API", assignee: "Kabir", est: 3, deps: ["t1", "t2"], entities: ["auth", "database"] },
  { id: "t4", title: "Study groups API", assignee: "Kabir", est: 4, deps: ["t2"], entities: ["database", "pagination"] },
  { id: "t5", title: "Groups list page", assignee: "Meera", est: 3, deps: ["t4"], entities: ["pagination", "frontend"] },
  { id: "t6", title: "Analytics dashboard", assignee: "Meera", est: 3, deps: ["t4"], entities: ["Chart.js", "dashboard"] },
  { id: "t7", title: "Frontend state setup", assignee: "Meera", est: 1, deps: [], entities: ["Redux", "state management"] },
  { id: "t8", title: "Notifications", assignee: "Riya", est: 2, deps: ["t3", "t4"], entities: ["notifications"] },
  { id: "t9", title: "Testing & bug bash", assignee: "Riya", est: 3, deps: ["t5", "t6", "t8"], entities: ["testing"] },
  { id: "t10", title: "Deploy", assignee: "Kabir", est: 1, deps: ["t9"], entities: ["deploy"] },
];
