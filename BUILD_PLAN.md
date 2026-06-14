# BUILD_PLAN.md — Splitwise Clone

## 1. Product Research Summary

### Key Splitwise Workflows Identified
Through reverse engineering Splitwise, the following core user flows were documented:

1. **Sign up & profile** — Users create an account with name + email + password. Avatars use initials (no photo upload).
2. **Group creation** — User creates a group (e.g. "Trip to Goa") and invites friends by email address.
3. **Adding expenses** — Any member adds an expense: enter description, total amount, who paid, and how to split it.
4. **Dashboard summary** — Shows "you owe" and "you are owed" aggregated across all groups at a glance.
5. **Simplified debt list** — Each group shows a minimised debt list (not every raw transaction), e.g. "Alice owes Bob ₹500".
6. **Settle up** — Members record a direct payment to mark a debt as paid.
7. **Expense chat** — Each expense has a comment thread where members can discuss context.

### Product Assumptions Made
- **No multi-currency** — INR (₹) only; exchange rates add complexity beyond scope
- **No recurring expenses** — every expense is one-time
- **No expense categories or receipts** — description field only
- **No email notifications** — no SMTP/email infra needed
- **Web only** — no React Native / mobile app
- **No expense editing** — delete and recreate; simplifies audit trail
- **Invite by email only** — no shareable group link
- **No OAuth** — email + password only
- **No pagination** — fetch all records (max 100 limit)

### Scope Decision
This is a realistic simplified clone covering all core Splitwise features but omitting the above assumptions. The goal is a fully working, deployable MVP that demonstrates all primary user journeys.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────┐
│           FRONTEND (React + Vite)    │
│  React Router v6 + Axios + Tailwind │
│  Socket.io-client for chat          │
│  Deployed on Vercel                 │
└────────────────┬────────────────────┘
                 │ HTTPS + WebSocket
┌────────────────▼────────────────────┐
│        BACKEND (Node + Express)      │
│  REST API + Socket.io server        │
│  Sequelize ORM                      │
│  JWT Auth (localStorage)            │
│  Deployed on Railway/Render         │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│         DATABASE (MySQL)             │
│  Provisioned on Railway/Render      │
│  6 core tables                      │
└─────────────────────────────────────┘
```

### Key Architectural Decisions
- **Monorepo structure**: `/backend` and `/frontend` in one repo
- **Sequelize sync** in dev (`alter: true`), migrations for prod
- **Balance calculation** is server-side: greedy debt-simplification algorithm
- **Socket.io** attached to same Express HTTP server (no separate WS server)
- **CORS** restricted to `FRONTEND_URL` env var
- **JWT** in `Authorization: Bearer <token>` header via Axios interceptor

---

## 3. Build Order & Sequence

| Step | Task | Status |
|------|------|--------|
| 1 | Scaffold backend (Express + Sequelize + MySQL config) | ✅ |
| 2 | Create all Sequelize models | ✅ |
| 3 | Auth routes (register, login, JWT middleware) | ✅ |
| 4 | Group routes (CRUD + member management) | ✅ |
| 5 | Expense routes (create with all 4 split types) | ✅ |
| 6 | Balance calculator + /balances endpoint | ✅ |
| 7 | Settlement routes | ✅ |
| 8 | Socket.io chat + message routes | ✅ |
| 9 | Scaffold frontend (Vite + Tailwind + React Router) | ✅ |
| 10 | Auth pages + AuthContext | ✅ |
| 11 | Dashboard page | ✅ |
| 12 | Group detail page + member management UI | ✅ |
| 13 | New expense form (all 4 split types) | ✅ |
| 14 | Expense detail page + ChatBox | ✅ |
| 15 | Settle up form | ✅ |
| 16 | Balance summary component | ✅ |
| 17 | Deploy backend to Railway/Render | ⬜ |
| 18 | Deploy frontend to Vercel | ⬜ |
| 19 | Write README.md, finalize docs | ✅ |

---

## 4. AI Collaboration Process

This project was built with **Claude** (Anthropic, claude.ai) as the primary AI development collaborator.

### How the Collaboration Worked
1. **Full context upfront** — The complete product spec (schema, API design, tech stack, split logic, deployment plan) was provided in a single prompt before any code was written.
2. **Docs before code** — AI generated `BUILD_PLAN.md` and `AI_CONTEXT.md` first, establishing a shared source of truth.
3. **Clarifying Q&A phase** — AI asked clarifying questions about:
   - Frontend framework choice (React + Vite selected)
   - Backend framework (Express + Node.js selected)
   - Deployment targets (Vercel for frontend, Railway/Render for backend)
   - Auth method (JWT in localStorage chosen over httpOnly cookies)
   - Real-time approach (Socket.io chosen over WebSocket/SSE)
   - Split types to support (all 4: equal, unequal, percentage, shares)
   - Balance calculation method (greedy debt-simplification algorithm)
4. **Sequential feature build** — Features built one at a time in BUILD_ORDER sequence; each verified before next.
5. **AI_CONTEXT.md as living doc** — Updated throughout as decisions were made and code was written.

### Key Decisions Logged
| Decision | Chosen | Reason |
|----------|--------|--------|
| Auth storage | JWT in localStorage | Simpler for demo scope |
| Real-time | Socket.io | Full duplex, easy room management |
| Balance algo | Greedy debt simplification | O(n log n), good enough for small groups |
| Split types | All 4 (equal/unequal/pct/shares) | Full Splitwise parity |
| DB | MySQL + Sequelize | Relational integrity for splits/balances |
| Avatar | Initials only | No file upload infra needed |

### Prompts Archive
All prompts and AI responses are documented in the `/prompts` folder:
- `prompts/01_initial_prompt.md` — The full initial product spec prompt
- `prompts/02_changes.md` — Changes and corrections made during build
- `prompts/03_ai_responses.md` — Key AI decisions and responses

---

## 5. Tradeoffs Made

| Decision | Rationale |
|----------|-----------|
| MySQL over MongoDB | Relational data (splits, balances) is naturally tabular; foreign keys enforce integrity |
| JWT in localStorage | Simpler than httpOnly cookies for a demo app; acceptable for internship scope |
| Sequelize sync (dev) | Avoids migration complexity during rapid development |
| No expense editing | Simplifies audit trail; delete + recreate is acceptable for scope |
| Greedy debt simplification | O(n log n), sufficient for small groups; optimal minimization is NP-hard |
| Socket.io on same server | Avoids infra complexity; scales fine for demo load |
| INR only | Single currency removes exchange rate complexity |
| Initials avatar | No file upload infra needed |

---

## 6. Verification Approach
- Each backend route manually tested via local API calls before frontend wired up
- Frontend verified by walking through each user flow in browser
- Balance calculator unit-tested with edge cases (zero balance, single debtor, etc.)
