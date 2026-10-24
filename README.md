# 🧠 Team Memory

Reads a team's meeting notes, chats and code. Remembers every decision. Flags when the code or a newer
decision quietly contradicts an old one. Simulates "what if we reverse this decision?" on the project plan.

**Status of this starter: the full flow already works end to end in offline mode.**
On the StudySync demo it catches **8/8 planted items with 0 false alarms** (see `data/ANSWER_KEY.md`).
Your job this weekend: make it work with a real LLM, make it look great, and pitch it.

---

## Setup (10 minutes, one person, then share the repo)

1. Install **Node.js 20+** (nodejs.org, LTS).
2. In this folder: `npm install`, then `npm run dev`. Open http://localhost:3000 and click **Load demo project**.
   Without an API key it runs in **offline mode** (pre-baked AI answers), so everyone can work tonight.
3. Copy `.env.example` → `.env.local` and add `ANTHROPIC_API_KEY=...` to switch on the real AI.
   Using a different LLM? Edit **only** `lib/ai/llm.ts`.
4. Push to a new GitHub repo, import it on **vercel.com**, add the same env vars there. Deploy tonight, not Sunday.

## How it works

```
/api/docs ──► docs (notes, chats, commits) + package.json + tasks
   │
   ├─► /api/extract  (one doc per call)  LLM → Decision[]
   │
   └─► /api/check
         1. pair decisions on the same topic → LLM judge → supersedes / contradicts / unrelated
         2. still-active decisions vs package.json (no AI) → code contradictions + commit evidence
   ▼
 Memory saved in the browser (lib/store.ts) → pages: Alerts, Decisions, Ask, What if?
```

## Who owns what

Each person edits **only their own files**. That's how three beginners avoid merge conflicts.
`types/schema.ts` is the shared contract: change it only after telling the other two.

### Person 1 — Frontend & Simulation
**Files:** `app/page.tsx`, `app/alerts/`, `app/decisions/`, `app/ask/`, `app/impact/`, `components/`, `lib/client/`, `lib/sim/cpm.ts`

- Make it look like a product: landing copy, spacing, colors, loading states, mobile check.
- **Alerts page = the demo's hero screen.** Make the "decision vs code" evidence cards unmissable.
- Ask page: nicer chat, citation chips already work (`[note-3]` → clickable).
- What-if page: already works on the demo plan. Polish it; add a "critical path" highlight.
- Sunday: pitch slides + record the backup demo video.

### Person 2 — Data & Backend
**Files:** `data/demo.ts`, `data/ANSWER_KEY.md`, `app/api/docs/`, `app/api/ingest/`, `lib/github/`, `lib/checks/code.ts`

- Create a **real public GitHub repo for StudySync** so the GitHub mode can be demoed live:
  - `package.json` = `DEMO_PACKAGE_JSON` from `data/demo.ts`
  - `notes/*.md` = the notes from `data/demo.ts`, each starting with `date: YYYY-MM-DD`
  - commits with the same messages as the demo commits
  - Issues = the tasks; in each body write `estimate: 3d` and `depends on #2`; use labels for topics (`auth`, `database`…)
- Test the **Connect your own** box with that repo; fix whatever breaks.
- Grow the `TECH` list in `lib/checks/code.ts` (more frameworks = more catches on judges' repos).
- Stretch (only after Sat 9 PM): Supabase instead of localStorage, by rewriting `lib/store.ts` only.

### Person 3 — AI
**Files:** `lib/ai/`, `lib/checks/relations.ts`, `app/api/extract/`, `app/api/check/`, `app/api/ask/`, `data/mock.ts`

- Tonight: get a key working, load the demo with the real LLM, compare against `data/mock.ts`.
- Tune `lib/ai/prompts.ts` until the real LLM also gets **8/8, 0 false alarms**. Write the score down after every change.
- Watch for: entity names (must say "Firebase", not "auth provider"), supersede vs contradict confusion.
- Write 2–3 extra test notes with tricky cases, check nothing new gets falsely flagged.
- `data/mock.ts` is the offline backup. Keep it, it saves the demo if the API fails on stage.

## Timeline (deadline Sunday 25 Oct, end of day)

| When | Person 1 | Person 2 | Person 3 |
|---|---|---|---|
| **Fri night** | Run it, read every page's code, deploy to Vercel | Run it, start the real StudySync GitHub repo | Get API key working, first real-LLM run + score |
| **Sat 9–1** | Alerts + landing polish | GitHub repo finished, GitHub mode tested | Prompt tuning for extraction |
| **Sat 2–8** | Ask + Decisions + What-if polish | Upload flow + more `TECH` entries | Judge prompt tuning, tricky test notes |
| **Sat 9 PM** | ✅ **Checkpoint: live Vercel URL works end to end with the real LLM.** Fix before anything new. | | |
| **Sat night** | Stretch: animations on Alerts | Stretch: Supabase | Stretch: better Ask answers |
| **Sun 12 PM** | ⛔ **Feature freeze** | | |
| **Sun 12–6** | Slides + demo video | Bug fixes on the live URL | Final score for the pitch |
| **Sun 9–10 PM** | 🚀 **Submit** (not at 11:59) | | |

## Demo script (3 minutes)
1. "Every team forgets why it decided things — and then the code drifts." (15 s)
2. Load demo → progress log reads the notes live. (30 s)
3. **Alerts:** "In July they decided Firebase. Our system read the code: it's Supabase now — here's the commit — and nobody recorded why." (45 s)
4. Point out it did **not** flag the moved deadline: it knows the difference between changing your mind and forgetting. (20 s)
5. Ask: "What did we decide about passwords?" → cited answer showing the conflict. (30 s)
6. What if: reverse the auth decision → deadline 13 → 16 days, Riya overloaded. (30 s)
7. "8/8 planted contradictions, 0 false alarms." (10 s)

## Rules
- Stuck 30 min → paste the full error into an AI assistant. Stuck 60 min → tell the team, cut it.
- `git pull` before you start, commit + push every hour, check the Vercel URL after each push.
- Give AI coding tools the schema file + one exact task, never "build my app".
