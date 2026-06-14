# Prompt 03 — Key AI Decisions & Responses

**Date**: 2026-06-14  
**Tool**: Claude (claude.ai)

This file documents the key decisions Claude made during the build, and the rationale behind each.

---

## Decision 01 — Documentation First

**AI reasoning**: Before writing any code, generated `BUILD_PLAN.md` and `AI_CONTEXT.md` as living documents. This ensures:
- A single source of truth exists for the whole project
- Any evaluator can paste `AI_CONTEXT.md` into an AI and recreate the app
- Schema, API, and architecture decisions are locked before implementation begins

---

## Decision 02 — Backend Architecture

**Chosen**: Monorepo with `/backend` + `/frontend` in one git repo.

**Rationale**:
- Simpler for a single developer
- Single `git push` deploys both
- Shared `.gitignore` and documentation at root

**Alternative considered**: Separate repos — rejected because it adds complexity without benefit at this scale.

---

## Decision 03 — Sequelize Model Associations

**AI response**: All model associations defined in a central `models/index.js` file rather than in each model file.

**Rationale**:
- Prevents circular dependency issues (e.g. User requires Group, Group requires User)
- Single place to see all relationships
- Easier to audit for missing FK definitions

**Key associations**:
- `Group.belongsToMany(User)` through `GroupMember` (many-to-many)
- `Expense.hasMany(ExpenseSplit)` — one expense, many split rows
- `ExpenseMessage.belongsTo(User, { as: 'sender' })` — aliased to avoid conflict

---

## Decision 04 — Balance Calculator Algorithm

**AI chose**: Greedy debt simplification (not optimal NP-hard minimization).

**Algorithm**:
```
1. Compute net[userId] = Σ(paid) - Σ(owed) for all expenses
2. Apply settlements: net[payer] += amount, net[payee] -= amount
3. Split into creditors (net > 0) and debtors (net < 0)
4. Sort both descending by absolute value
5. Greedily pair largest creditor with largest debtor
6. Emit transaction, reduce both by min(creditor, debtor)
7. Repeat until balanced
```

**Why greedy**: O(n log n), correct for practical group sizes (< 50 members). True minimum transaction count is NP-complete.

---

## Decision 05 — Split Calculator Rounding

**AI approach**: Last member in the list absorbs any rounding difference.

**Example**: ₹100 / 3 = ₹33.33 each. Total distributed = ₹33.33 + ₹33.33 = ₹66.66. Last member gets ₹100 - ₹66.66 = ₹33.34.

**Why**: Floating point addition can cause off-by-one-cent errors. This guarantees `sum(owed_amounts) === total_amount` exactly.

---

## Decision 06 — Socket.io Chat Architecture

**AI response**: Socket.io attached to the same Express HTTP server (not a separate WebSocket server).

**Room strategy**: Each expense gets its own Socket.io room named `expense_{id}`.

**Flow**:
```
Client connects to Socket.io server
Client emits: join_expense { expense_id }  →  server.join(`expense_${id}`)
Client emits: send_message { expense_id, message, user_id }
Server: saves to DB, broadcasts receive_message to room
All clients in room receive: { id, sender, message, created_at }
```

**Tradeoff**: Not horizontally scalable (needs Redis adapter for multi-instance). Acceptable for demo/internship scope.

---

## Decision 07 — Frontend Auth Pattern

**AI chose**: React Context (`AuthContext`) + localStorage.

**Pattern**:
```jsx
// AuthContext stores: { user, token, login(), logout() }
// Axios interceptor reads token from localStorage on every request
// ProtectedRoute wrapper redirects to /login if no user
// 401 response interceptor auto-logs out and redirects
```

**Why not Redux**: Overkill for this app. Context + local state is sufficient.

**Why not httpOnly cookies**: Requires CORS `credentials: true` + server-side cookie config. JWT in localStorage is simpler for a demo.

---

## Decision 08 — CSS Approach

**AI chose**: Vanilla CSS custom properties (CSS variables) for the design system + TailwindCSS for utilities.

**Design decisions**:
- Dark theme (`#0f0f1a` background) as default — no light/dark toggle needed
- Glassmorphism cards (`backdrop-filter: blur`) for premium feel
- Green (`#1db954`) + Purple (`#8b5cf6`) gradient as brand accent
- Inter font from Google Fonts
- CSS variables for all theme colors (easy to update globally)
- Micro-animations: `fadeIn`, hover `translateY`, `box-shadow` transitions

**Why inline styles for layout**: Component-scoped layout styles are clearer than utility classes for complex flexbox layouts.

---

## Decision 09 — Error Handling

**AI pattern**: All controllers wrapped in try/catch. Error format is always:
```json
{ "error": "Human-readable message" }
```

**HTTP status codes used**:
- `400` — validation error (missing fields, sum mismatch)
- `401` — not authenticated
- `403` — authenticated but not authorized (not a member)
- `404` — resource not found
- `409` — conflict (duplicate email, already a member)
- `500` — unexpected server error

---

## Decision 10 — `setup-db.js` Helper Script

**Why created**: MySQL requires the database to exist before Sequelize can sync tables. Added a one-time setup script that:
1. Connects to MySQL without specifying a database
2. Runs `CREATE DATABASE IF NOT EXISTS splitwise`
3. Exits cleanly

**Usage**: `node setup-db.js` — run once before first `npm start`.

---

## Key Files Generated by AI

| File | Lines | Purpose |
|------|-------|---------|
| `backend/server.js` | 70 | Express + Socket.io + route registration |
| `backend/src/models/index.js` | 65 | All Sequelize associations |
| `backend/src/utils/balanceCalculator.js` | 80 | Greedy debt algorithm |
| `backend/src/utils/splitCalculator.js` | 80 | All 4 split type calculations |
| `backend/src/controllers/groupController.js` | 160 | Group CRUD + member management + balances |
| `frontend/src/pages/GroupDetail.jsx` | 280 | Tabbed group page (expenses/balances/members/settlements) |
| `frontend/src/components/SplitForm.jsx` | 190 | Dynamic split type form with live validation |
| `frontend/src/components/ChatBox.jsx` | 180 | Socket.io real-time chat |
| `frontend/src/index.css` | 250 | Full design system (dark theme, glassmorphism) |

---

## What the AI Did NOT Do (by design)

- Did not invent requirements not in the spec
- Did not add OAuth, email verification, or extra features
- Did not use MongoDB, Redis, or any tech outside the specified stack
- Did not skip any of the 19 build steps
- Did not write automated tests (explicitly excluded from scope)
