# AI_CONTEXT.md — Splitwise Clone (Source of Truth)

> **Instructions for evaluators**: Paste this entire file into Claude (or any capable AI) and ask it to recreate the app. All decisions, schema, APIs, and architecture are fully specified here.

---

## 1. Product Understanding

Splitwise is a collaborative expense-splitting app. The core problem it solves: when a group of people share costs (trips, rent, meals), keeping track of who paid what and who owes whom becomes complex. Splitwise automates this by:
- Tracking every expense and how it's split
- Computing a running net balance per user
- Simplifying the debt graph to minimize transactions
- Providing a settlement flow to mark debts as paid

---

## 2. Product Scope (This Build)

### Included
- Email/password authentication with JWT
- Create and manage groups with multiple members
- Add expenses with 4 split types: equal, unequal, percentage, shares
- Delete expenses
- View group balances (simplified debt list)
- Record settlements (payments between members)
- Real-time chat per expense (Socket.io)
- Dashboard with all groups and overall balance

### Excluded (Simplifications)
- No OAuth / social login
- No email verification
- No profile picture upload (use initials)
- No expense editing (delete + recreate)
- No push notifications
- No multi-currency (INR ₹ only)
- No pagination (fetch all, max 100)
- No read receipts or typing indicators
- No expense categories or tags

---

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite), React Router v6, Axios, TailwindCSS |
| Backend | Node.js 18+, Express.js |
| Database | MySQL 8 (relational only) |
| ORM | Sequelize v6 |
| Auth | JWT (jsonwebtoken), bcrypt, stored in localStorage |
| Real-time | Socket.io v4 |
| Frontend Deploy | Vercel |
| Backend Deploy | Railway or Render |

---

## 4. Database Schema

### `users`
```sql
id            INT PK AUTO_INCREMENT
name          VARCHAR(255) NOT NULL
email         VARCHAR(255) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
avatar_url    VARCHAR(255) NULL
created_at    DATETIME DEFAULT NOW()
```

### `groups`
```sql
id            INT PK AUTO_INCREMENT
name          VARCHAR(255) NOT NULL
description   VARCHAR(500) NULL
created_by    INT FK → users.id
created_at    DATETIME DEFAULT NOW()
```

### `group_members`
```sql
id            INT PK AUTO_INCREMENT
group_id      INT FK → groups.id
user_id       INT FK → users.id
role          ENUM('admin','member') DEFAULT 'member'
joined_at     DATETIME DEFAULT NOW()
```

### `expenses`
```sql
id            INT PK AUTO_INCREMENT
group_id      INT FK → groups.id
description   VARCHAR(500) NOT NULL
total_amount  DECIMAL(10,2) NOT NULL
paid_by       INT FK → users.id
split_type    ENUM('equal','unequal','percentage','shares') NOT NULL
created_by    INT FK → users.id
created_at    DATETIME DEFAULT NOW()
```

### `expense_splits`
```sql
id            INT PK AUTO_INCREMENT
expense_id    INT FK → expenses.id
user_id       INT FK → users.id
owed_amount   DECIMAL(10,2) NOT NULL  ← always final calculated value
share_value   DECIMAL(10,4) NULL       ← raw input (shares or %)
created_at    DATETIME DEFAULT NOW()
```

### `settlements`
```sql
id            INT PK AUTO_INCREMENT
group_id      INT FK → groups.id
paid_by       INT FK → users.id
paid_to       INT FK → users.id
amount        DECIMAL(10,2) NOT NULL
note          VARCHAR(500) NULL
created_at    DATETIME DEFAULT NOW()
```

### `expense_messages`
```sql
id            INT PK AUTO_INCREMENT
expense_id    INT FK → expenses.id
user_id       INT FK → users.id
message       TEXT NOT NULL
created_at    DATETIME DEFAULT NOW()
```

---

## 5. API Design

All routes prefixed with `/api`. All protected routes require `Authorization: Bearer <JWT>` header.

### Authentication
```
POST /api/auth/register   → { name, email, password } → { token, user }
POST /api/auth/login      → { email, password }        → { token, user }
```

### Users
```
GET /api/users/me                      → current user object
GET /api/users/search?email=...        → [ user objects ] (for invite)
```

### Groups
```
POST   /api/groups                     → create group
GET    /api/groups                     → list user's groups
GET    /api/groups/:id                 → group detail + members
POST   /api/groups/:id/members         → add member by email
DELETE /api/groups/:id/members/:userId → remove member
GET    /api/groups/:id/balances        → simplified debt list
```

### Expenses
```
POST   /api/groups/:id/expenses        → create expense + splits
GET    /api/groups/:id/expenses        → list expenses
GET    /api/expenses/:id               → expense detail + splits
DELETE /api/expenses/:id               → delete expense + splits
```

### Settlements
```
POST /api/groups/:id/settlements       → record payment
GET  /api/groups/:id/settlements       → list settlements
```

### Chat
```
GET /api/expenses/:id/messages         → message history

Socket.io events:
  Client → Server: join_expense  { expense_id }
  Client → Server: send_message  { expense_id, message }
  Server → Client: receive_message { id, user, message, created_at }
```

---

## 6. Balance Calculation Logic

**Location**: `backend/src/utils/balanceCalculator.js`

**Algorithm**:
1. For each user in group, compute `net = Σ(paid_by amounts) - Σ(owed_amounts from splits)`
2. Factor in settlements: `net[paid_by] += amount`, `net[paid_to] -= amount`
3. Separate into creditors (net > 0) and debtors (net < 0)
4. Greedy match: pair largest creditor with largest debtor
5. Output: `[{ from: userId, to: userId, amount: decimal }]`

**Split Type Calculations** (`backend/src/utils/splitCalculator.js`):
- **Equal**: `owed = total / members.length` (last member absorbs rounding)
- **Unequal**: amounts provided directly; must sum to total (validated server-side)
- **Percentage**: `owed = (pct / 100) * total`; must sum to 100%
- **Shares**: `owed = (userShares / totalShares) * total`

---

## 7. Frontend Structure

### Pages / Routes
```
/login                        → Login page
/register                     → Register page
/dashboard                    → All groups + overall balance summary
/groups/:id                   → Group detail (members, expenses, balances)
/groups/:id/expenses/new      → Add expense form
/expenses/:id                 → Expense detail + chat
/groups/:id/settle            → Record a payment
```

### Key Components
```
Navbar              → top nav with logout
GroupCard           → group list item
ExpenseCard         → expense list item
BalanceSummary      → shows simplified "X owes Y ₹Z" list
SplitForm           → dynamic form for all 4 split types
ChatBox             → Socket.io connected message feed
MemberManager       → add/remove group members
SettleUpForm        → record payment between two members
```

### State Management
- `AuthContext` (React Context): holds `{ user, token, login(), logout() }`
- Everything else: local component state
- Axios instance: injects `Authorization: Bearer <token>` automatically

---

## 8. Folder Structure

```
splitwise/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           ← Sequelize connection
│   │   │   └── socket.js       ← Socket.io setup
│   │   ├── models/
│   │   │   ├── index.js        ← model associations
│   │   │   ├── User.js
│   │   │   ├── Group.js
│   │   │   ├── GroupMember.js
│   │   │   ├── Expense.js
│   │   │   ├── ExpenseSplit.js
│   │   │   ├── Settlement.js
│   │   │   └── ExpenseMessage.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── groups.js
│   │   │   ├── expenses.js
│   │   │   ├── settlements.js
│   │   │   └── messages.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── groupController.js
│   │   │   ├── expenseController.js
│   │   │   ├── settlementController.js
│   │   │   └── messageController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   └── utils/
│   │       ├── balanceCalculator.js
│   │       └── splitCalculator.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js        ← configured Axios instance + API fns
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── GroupDetail.jsx
│   │   │   ├── NewExpense.jsx
│   │   │   ├── ExpenseDetail.jsx
│   │   │   └── SettleUp.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── GroupCard.jsx
│   │   │   ├── ExpenseCard.jsx
│   │   │   ├── BalanceSummary.jsx
│   │   │   ├── SplitForm.jsx
│   │   │   ├── ChatBox.jsx
│   │   │   ├── MemberManager.jsx
│   │   │   └── SettleUpForm.jsx
│   │   ├── utils/
│   │   │   ├── formatCurrency.js
│   │   │   └── formatDate.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env
│   └── package.json
│
├── AI_CONTEXT.md   ← this file (source of truth)
├── BUILD_PLAN.md
└── README.md
```

---

## 9. Deployment Plan

### Backend (Railway or Render)
- Push `/backend` directory
- Environment variables required:
  ```
  DB_HOST=<mysql host>
  DB_PORT=3306
  DB_USER=<mysql user>
  DB_PASS=<mysql password>
  DB_NAME=splitwise
  JWT_SECRET=<random 64-char secret>
  PORT=4000
  FRONTEND_URL=https://your-app.vercel.app
  NODE_ENV=production
  ```
- `sequelize.sync({ alter: true })` runs on startup
- Start command: `node server.js`

### Frontend (Vercel)
- Push `/frontend` directory
- Environment variables:
  ```
  VITE_API_URL=https://your-backend.railway.app
  ```
- `vercel.json` rewrites all routes to `index.html` for React Router
- Build command: `npm run build`
- Output directory: `dist`

---

## 10. Engineering Requirements

- Node.js ≥ 18
- MySQL ≥ 8
- All amounts stored as DECIMAL(10,2) to avoid floating point errors
- bcrypt saltRounds = 10
- JWT expiry = 7 days
- CORS: allow only FRONTEND_URL in production
- Socket.io CORS: same FRONTEND_URL restriction
- Express error handler: returns `{ error: "message" }` JSON
- All DB queries use Sequelize (no raw SQL except for balance aggregation)

---

## 11. Testing Plan

### Manual Test Cases

All testing is manual for this MVP. Use Postman or Thunder Client for API tests.

| # | Test Case | Expected Result |
|---|-----------|----------------|
| 1 | Register user → login → receive JWT | 201 on register, 200 on login, token in response |
| 2 | Create group → invite user by email → confirm member appears | Group created, member visible in `/groups/:id` |
| 3 | Remove a member from group | Member gone from membership list |
| 4 | Add expense (equal split) → check `expense_splits` | Each row has `owed_amount = total / count` |
| 5 | Add expense (unequal) → amounts must sum to total | 400 error if sum ≠ total; 201 if valid |
| 6 | Add expense (percentage) → percentages must sum to 100 | 400 error if sum ≠ 100%; 201 if valid |
| 7 | Add expense (shares) → verify proportional amounts | `owed = (user_shares / total_shares) * total` |
| 8 | Open expense → send chat message → verify real-time delivery | Second browser tab receives message without refresh |
| 9 | `GET /groups/:id/balances` → verify simplified debt list | Correct "A owes B ₹X" output, minimised transactions |
| 10 | Record a settlement → verify balances update | Balance decreases or disappears after settlement |
| 11 | Delete an expense → verify splits are removed | Expense gone, `expense_splits` rows deleted |

### API Testing
- Tool: Postman or Thunder Client (VS Code extension)
- Set `Authorization: Bearer <token>` header on all protected routes
- Test happy path + error cases (missing fields, wrong credentials, non-member access)

### Balance Calculator Edge Cases
- All members paid equally → no balances
- Single debtor → one transaction
- Circular debts (A→B→C→A) → simplified correctly
- After settlement → balance reduced accordingly

### No Automated Tests
No unit/integration test suite required for this MVP scope.

---

## 12. Known Limitations

- JWT in localStorage is vulnerable to XSS (acceptable for demo/internship scope)
- `sequelize.sync({ alter: true })` can cause data loss on schema changes in production
- Balance calculation fetches all expenses/settlements in memory (not scalable beyond ~1000 records)
- Socket.io runs on same process as API (not horizontally scalable without Redis adapter)
- No rate limiting on auth endpoints
- No input sanitization beyond Sequelize parameterized queries
- Chat messages not paginated (loads all on mount)

---

## 13. Implementation Log

### Changes During Build

| Date | Change | Reason |
|------|--------|--------|
| 2026-06-14 | Initial scaffold — backend + frontend | Project start |
| 2026-06-14 | Fixed CSS `@import` order (Google Fonts before Tailwind) | Vite build warning |
| 2026-06-14 | Fixed dynamic `import()` in GroupDetail → static import | Build warning + correctness |
| 2026-06-14 | Added `setup-db.js` helper script | MySQL `CREATE DATABASE` automation |
| 2026-06-14 | Added `/prompts` folder with AI collaboration docs | Assignment requirement |

---

## 14. All Prompts Used

See the `/prompts` folder for the full archive:
- [`prompts/01_initial_prompt.md`](./prompts/01_initial_prompt.md) — Full product spec prompt used to start the build
- [`prompts/02_changes.md`](./prompts/02_changes.md) — Changes and follow-up instructions during build
- [`prompts/03_ai_responses.md`](./prompts/03_ai_responses.md) — Key AI decisions and responses

### Session Summary
- **Tool used**: Claude (Anthropic) — claude.ai
- **Session date**: 2026-06-14
- **Approach**: Full context upfront, strict build order, docs before code
- **Total files generated**: 69 source files across backend + frontend
- **Build time**: ~1 session
