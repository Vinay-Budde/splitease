# BUILD_PLAN.md — Splitwise Clone

## 1. Product Research Summary

### What Splitwise Does (Core Flow)
Splitwise is a group expense splitting app. The core loop is:
1. Users form a **group** (e.g., "Trip to Goa").
2. Any member can add an **expense** (e.g., "Hotel ₹3000, paid by Alice").
3. The app calculates **who owes whom**, supporting equal, unequal, percentage, and share-based splits.
4. Members can **settle debts** (record payments).
5. Real-time **chat** per expense for context and discussion.
6. A **balance summary** (simplified debt graph) shows the minimum set of transactions to settle all debts.

### Scope Decision
This is a realistic simplified clone covering all core Splitwise features but omitting:
- OAuth / social login
- Email verification
- Profile picture uploads (avatars use initials)
- Expense editing (create + delete only)
- Push notifications
- Multi-currency
- Pagination (limited to 100 records)
- Read receipts / typing indicators in chat

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
| 1 | Scaffold backend (Express + Sequelize + MySQL config) | ⬜ |
| 2 | Create all Sequelize models | ⬜ |
| 3 | Auth routes (register, login, JWT middleware) | ⬜ |
| 4 | Group routes (CRUD + member management) | ⬜ |
| 5 | Expense routes (create with all 4 split types) | ⬜ |
| 6 | Balance calculator + /balances endpoint | ⬜ |
| 7 | Settlement routes | ⬜ |
| 8 | Socket.io chat + message routes | ⬜ |
| 9 | Scaffold frontend (Vite + Tailwind + React Router) | ⬜ |
| 10 | Auth pages + AuthContext | ⬜ |
| 11 | Dashboard page | ⬜ |
| 12 | Group detail page + member management UI | ⬜ |
| 13 | New expense form (all 4 split types) | ⬜ |
| 14 | Expense detail page + ChatBox | ⬜ |
| 15 | Settle up form | ⬜ |
| 16 | Balance summary component | ⬜ |
| 17 | Deploy backend to Railway/Render | ⬜ |
| 18 | Deploy frontend to Vercel | ⬜ |
| 19 | Write README.md, finalize docs | ⬜ |

---

## 4. AI Collaboration Process

This project was built with the assistance of **Claude** (Anthropic) as the primary coding AI.

### Workflow
1. Full product context was provided upfront — no scoping questions needed.
2. BUILD_PLAN.md and AI_CONTEXT.md were generated before any code.
3. Features were built one at a time, in the sequence defined above.
4. Each step was verified before proceeding.
5. AI_CONTEXT.md was updated whenever schema, APIs, or logic changed.

### Prompting Strategy
- Single large context document provided upfront
- Strict build order enforced to prevent dependency issues
- All decisions pre-made to avoid AI hallucinating requirements

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
