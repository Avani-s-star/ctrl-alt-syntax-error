# Answer key for the StudySync demo data

Use this to score the system. Report it in the pitch as "caught X of 8, Y false alarms".

## Code contradictions (decision says X, code uses Y, nobody recorded the switch)

| # | Decision (source) | Code reality | Evidence commit |
|---|---|---|---|
| C1 | Firebase for auth (note-1) | `@supabase/supabase-js` | commit-a1f3 |
| C2 | MongoDB Atlas for database (note-1) | `@prisma/client` (Postgres) | commit-b72c |
| C3 | Redux Toolkit for state (note-1) | `zustand` | commit-c019 |
| C4 | Chart.js for dashboard charts (note-2) | `recharts` | commit-d55e |

## Decision vs decision

| # | Older | Newer | Correct label |
|---|---|---|---|
| S1 | CSS Modules (note-2) | Replacing CSS Modules with Tailwind (chat-1) | **supersedes** (not an alarm) |
| S2 | MVP deadline Oct 1 (note-1) | Deadline moved to Nov 15 (note-4) | **supersedes** (not an alarm) |
| D1 | All list APIs paginated, 20/page (note-2) | Groups list returns everything, no pagination (chat-2) | **contradicts** |
| D2 | Google sign-in only, no passwords stored (note-5) | All passwords hashed with bcrypt (note-6) | **contradicts** |

Note: note-3 (email + password) vs note-5 (Google only) is arguably "supersedes". Either label is acceptable; don't count it.

## Scoring
- Caught = items above that get the correct label.
- False alarm = any contradiction shown that is NOT C1–C4 or D1–D2 (e.g. S1 or S2 flagged as a contradiction).
