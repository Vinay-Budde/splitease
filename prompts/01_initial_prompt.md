# Prompt 01 — Initial Product Spec & Build Instruction

**Date**: 2026-06-14  
**Tool**: Claude (claude.ai)  
**Session type**: Full project build from scratch

---

## Full Prompt Sent to AI

> You are a junior engineer helping me complete an internship assignment.
> 
> The assignment is to reverse engineer Splitwise, scope a realistic version,
> and build a working deployed app.
> 
> Important instructions:
> 1. Do not assume product requirements — all decisions are already made below.
> 2. Do not ask further scoping questions — context is fully defined.
> 3. Build strictly according to this context.
> 4. Generate and maintain AI_CONTEXT.md and BUILD_PLAN.md as you build.
> 5. AI_CONTEXT.md must be the source of truth for the entire project.
> 6. Another evaluator should be able to paste AI_CONTEXT.md into the same AI
>    tool and recreate a similar app.
> 7. Before writing any code, produce a BUILD_PLAN.md based on this context.
> 8. During implementation, keep updating AI_CONTEXT.md whenever requirements,
>    architecture, schema, UI, or logic changes.
> 9. Build feature by feature. After each feature, confirm it works before moving on.
> 10. Do not skip any requirement listed below.

---

## Product Context Provided

### What we are building
A simplified Splitwise clone — a group expense splitting app where users can:
- Create accounts and log in
- Create groups and manage members
- Add expenses and split them multiple ways
- Chat inside each expense in real time
- View balances (group-wise and individual)
- Settle debts / record payments

---

## Tech Stack Specified

- Frontend: React (Vite), React Router v6, Axios, TailwindCSS
- Backend: Node.js, Express.js
- Database: MySQL (relational only — no NoSQL)
- ORM: Sequelize
- Auth: JWT stored in localStorage
- Real-time: Socket.io (for expense-level chat)
- Deployment:
  - Frontend → Vercel
  - Backend + MySQL → Railway or Render

---

## Authentication Requirements

- Email + password only (no OAuth)
- JWT stored in localStorage
- Protected routes on frontend using a React auth context
- Passwords hashed with bcrypt
- JWT secret stored in .env

---

## Database Schema Specified

### users
- id, name, email (unique), password_hash, avatar_url, created_at

### groups
- id, name, description, created_by (FK → users), created_at

### group_members
- id, group_id (FK), user_id (FK), role (enum: admin/member), joined_at

### expenses
- id, group_id (FK), description, total_amount (decimal), paid_by (FK), split_type (enum: equal/unequal/percentage/shares), created_by (FK), created_at

### expense_splits
- id, expense_id (FK), user_id (FK), owed_amount (decimal), share_value (decimal nullable), created_at

### settlements
- id, group_id (FK), paid_by (FK), paid_to (FK), amount (decimal), note, created_at

### expense_messages
- id, expense_id (FK), user_id (FK), message (text), created_at

---

## Balance Calculation Logic

- For each group, compute net balance per user:
  - Add amounts they paid
  - Subtract amounts they owe (from expense_splits)
  - Factor in settlements
- Use a debt-simplification algorithm to minimize number of transactions:
  - Build a net balance map
  - Greedily match biggest creditor with biggest debtor
  - Output: list of "X owes Y ₹Z"
- Expose this as a GET /groups/:id/balances API endpoint

---

## Split Type Logic

- Equal: total_amount / number of members
- Unequal: user inputs exact amounts per person (must sum to total)
- Percentage: user inputs % per person (must sum to 100), owed_amount = (percentage / 100) * total_amount
- Shares: user inputs share units per person, owed_amount = (user_shares / total_shares) * total_amount

---

## API Design

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Users
- GET /api/users/me
- GET /api/users/search?email=...

### Groups
- POST /api/groups
- GET /api/groups
- GET /api/groups/:id
- POST /api/groups/:id/members
- DELETE /api/groups/:id/members/:userId
- GET /api/groups/:id/balances

### Expenses
- POST /api/groups/:id/expenses
- GET /api/groups/:id/expenses
- GET /api/expenses/:id
- DELETE /api/expenses/:id

### Settlements
- POST /api/groups/:id/settlements
- GET /api/groups/:id/settlements

### Chat
- GET /api/expenses/:id/messages
- Socket.io: join_expense, send_message, receive_message

---

## Frontend Routes

- /login
- /register
- /dashboard
- /groups/:id
- /groups/:id/expenses/new
- /expenses/:id
- /groups/:id/settle

---

## Key Tradeoffs & Simplifications

- No email verification
- No profile picture upload (avatar_url stored but UI uses initials)
- No expense edit (only create and delete)
- No push notifications
- No multi-currency (all amounts in INR ₹)
- No pagination on expense lists (fetch all, limit 100)
- Sequelize sync used in dev
- Socket.io chat has no read receipts or typing indicators

---

## Build Order Specified

1. Scaffold backend (Express + Sequelize + MySQL connection)
2. Create all Sequelize models
3. Auth routes
4. Group routes
5. Expense routes (with split logic)
6. Balance calculator + /balances endpoint
7. Settlement routes
8. Socket.io chat
9. Scaffold frontend
10. Auth pages + AuthContext
11. Dashboard page
12. Group detail page
13. New expense form
14. Expense detail + ChatBox
15. Settle up form
16. Balance summary component
17. Deploy backend
18. Deploy frontend
19. Write README.md, AI_CONTEXT.md, BUILD_PLAN.md
