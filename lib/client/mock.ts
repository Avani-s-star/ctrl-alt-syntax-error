import type { Memory } from "@/types/schema";

// Fake data so the frontend never waits for the backend.
export const mockMemory: Memory = {
  tasks: [],
  builtAt: new Date().toISOString(),

  docs: [
    {
      id: "n1",
      type: "note",
      title: "Sprint planning, Sept 2",
      date: "2026-09-02",
      author: "Riya",
      text: "We chose Firebase for auth because of the free tier.",
    },
    {
      id: "n2",
      type: "note",
      title: "Backend sync, Sept 20",
      date: "2026-09-20",
      author: "Kabir",
      text: "Moving the database to Supabase for SQL support.",
    },
    {
      id: "n3",
      type: "note",
      title: "Kickoff, Aug 15",
      date: "2026-08-15",
      author: "Riya",
      text: "REST is fine for the API. Keep it simple.",
    },
    {
      id: "n4",
      type: "note",
      title: "Data review, Sept 9",
      date: "2026-09-09",
      author: "Meera",
      text: "Let's store study sessions in MongoDB, it's flexible.",
    },
    {
      id: "n5",
      type: "chat",
      title: "Frontend chat, Sept 12",
      date: "2026-09-12",
      author: "Arjun",
      text: "Redux for global state, everyone okay with that?",
    },
    {
      id: "n6",
      type: "note",
      title: "Planning, Sept 25",
      date: "2026-09-25",
      author: "Meera",
      text: "Launch date is Nov 15.",
    },
    {
      id: "n7",
      type: "chat",
      title: "Standup, Oct 3",
      date: "2026-10-03",
      author: "Arjun",
      text: "Pushing launch to Dec 1, auth is running behind.",
    },
  ],

  decisions: [
    {
      id: "d1",
      what: "Use Firebase for auth",
      why: "Free tier",
      who: "Riya",
      date: "2026-09-02",
      entities: ["Firebase", "auth"],
      sourceId: "n1",
      status: "contradicted",
    },
    {
      id: "d2",
      what: "Move the database to Supabase",
      why: "SQL support",
      who: "Kabir",
      date: "2026-09-20",
      entities: ["Supabase", "database"],
      sourceId: "n2",
      status: "active",
    },
    {
      id: "d3",
      what: "Use REST for the API",
      why: "Keep it simple",
      who: "Riya",
      date: "2026-08-15",
      entities: ["REST", "API"],
      sourceId: "n3",
      status: "superseded",
    },
    {
      id: "d4",
      what: "Store sessions in MongoDB",
      why: "Flexible schema",
      who: "Meera",
      date: "2026-09-09",
      entities: ["MongoDB", "database"],
      sourceId: "n4",
      status: "contradicted",
    },
    {
      id: "d5",
      what: "Use Redux for state",
      why: "Team knows it",
      who: "Arjun",
      date: "2026-09-12",
      entities: ["Redux", "state"],
      sourceId: "n5",
      status: "contradicted",
    },
    {
      id: "d6",
      what: "Launch on Nov 15",
      why: "Semester deadline",
      who: "Meera",
      date: "2026-09-25",
      entities: ["launch", "deadline"],
      sourceId: "n6",
      status: "contradicted",
    },
    {
      id: "d7",
      what: "Push launch to Dec 1",
      why: "Auth is behind",
      who: "Arjun",
      date: "2026-10-03",
      entities: ["launch", "deadline"],
      sourceId: "n7",
      status: "active",
    },
  ],

  contradictions: [
    {
      id: "c1",
      decisionId: "d1",
      kind: "code",
      explanation:
        "Decision says Firebase, but the code has no firebase package.",
      evidence: [
        {
          label: "Decision (Sept 2, Riya)",
          snippet: "Use Firebase for auth",
        },
        {
          label: "package.json",
          snippet: "@supabase/supabase-js, next, react",
        },
      ],
    },
    {
      id: "c2",
      decisionId: "d4",
      kind: "code",
      explanation:
        "Decision says MongoDB, but the code has no mongodb package.",
      evidence: [
        {
          label: "Decision (Sept 9, Meera)",
          snippet: "Store sessions in MongoDB",
        },
        {
          label: "package.json",
          snippet: "@supabase/supabase-js, next, react",
        },
      ],
    },
    {
      id: "c3",
      decisionId: "d5",
      kind: "code",
      explanation:
        "Decision says Redux, but the code uses Zustand instead.",
      evidence: [
        {
          label: "Decision (Sept 12, Arjun)",
          snippet: "Use Redux for state",
        },
        {
          label: "package.json",
          snippet: "zustand, next, react",
        },
      ],
    },
    {
      id: "c4",
      decisionId: "d6",
      kind: "decision",
      explanation:
        "Two decisions give different launch dates, and the older one was never replaced.",
      evidence: [
        {
          label: "Decision (Sept 25, Meera)",
          snippet: "Launch on Nov 15",
        },
        {
          label: "Decision (Oct 3, Arjun)",
          snippet: "Push launch to Dec 1",
        },
      ],
    },
  ],
};

export const mockTasks = [
  {
    id: "t1",
    title: "Set up auth",
    est: 3,
    deps: [] as string[],
    entities: ["auth", "Firebase"],
  },
  {
    id: "t2",
    title: "Login page",
    est: 2,
    deps: ["t1"],
    entities: ["auth"],
  },
  {
    id: "t3",
    title: "Database schema",
    est: 2,
    deps: [],
    entities: ["Supabase", "database"],
  },
  {
    id: "t4",
    title: "Study timer state",
    est: 2,
    deps: [],
    entities: ["Redux", "state"],
  },
  {
    id: "t5",
    title: "Profile page",
    est: 3,
    deps: ["t2", "t3"],
    entities: [],
  },
  {
    id: "t6",
    title: "Dashboard",
    est: 3,
    deps: ["t3", "t4"],
    entities: [],
  },
  {
    id: "t7",
    title: "Deploy",
    est: 1,
    deps: ["t5", "t6"],
    entities: [],
  },
];