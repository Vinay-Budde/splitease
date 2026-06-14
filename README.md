# SplitEase — Splitwise Clone

> A full-stack group expense splitting app built as an internship assignment. 
> Reverse-engineered from Splitwise with a realistic feature set.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-blue) 
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![DB](https://img.shields.io/badge/Database-MySQL%20%2B%20Sequelize-orange)

---

## Features

- 🔐 **Auth** — Email + password, JWT stored in localStorage
- 👥 **Groups** — Create groups, add/remove members
- 💰 **Expenses** — Add expenses with 4 split types: Equal, Unequal, Percentage, Shares
- 📊 **Balances** — Simplified debt list (greedy algorithm minimizes transactions)
- 💸 **Settlements** — Record payments between members
- 💬 **Real-time Chat** — Socket.io chat on each expense
- 📱 **Responsive** — Dark glassmorphism UI with micro-animations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite), React Router v6, Axios, TailwindCSS |
| Backend | Node.js 18+, Express.js |
| Database | MySQL 8 (Sequelize ORM) |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Real-time | Socket.io v4 |
| Frontend Deploy | Vercel |
| Backend Deploy | Railway or Render |

---

## Project Structure

```
splitwise/
├── backend/           → Express API + Socket.io
│   ├── src/
│   │   ├── config/    → DB connection, Socket.io setup
│   │   ├── models/    → Sequelize models + associations
│   │   ├── routes/    → REST route definitions
│   │   ├── controllers/
│   │   ├── middleware/ → JWT auth middleware
│   │   └── utils/     → balanceCalculator, splitCalculator
│   └── server.js
└── frontend/          → React Vite app
    └── src/
        ├── api/       → Axios instance + API calls
        ├── context/   → AuthContext
        ├── pages/     → 7 pages
        ├── components/→ 8 reusable components
        └── utils/     → formatCurrency, formatDate
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- MySQL 8 running locally

### 1. Database Setup

```sql
CREATE DATABASE splitwise;
```

### 2. Backend

```bash
cd backend
npm install
```

Create `.env` (edit with your MySQL credentials):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=yourpassword
DB_NAME=splitwise
JWT_SECRET=your_super_secret_64_char_jwt_secret_here
PORT=4000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start dev server:
```bash
npm run dev
```

The server will auto-create all tables via `sequelize.sync({ alter: true })`.

### 3. Frontend

```bash
cd frontend
npm install
```

Create `.env`:
```env
VITE_API_URL=http://localhost:4000
```

Start dev server:
```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASS` | MySQL password | `password` |
| `DB_NAME` | Database name | `splitwise` |
| `JWT_SECRET` | Secret for signing JWTs | 64+ char random string |
| `PORT` | Server port | `4000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment | `development` / `production` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend URL | `http://localhost:4000` |

---

## Deployment

### Backend → Railway

1. Create a Railway project
2. Add a MySQL plugin (Railway provides managed MySQL)
3. Push `backend/` directory
4. Set all environment variables in Railway dashboard
5. Set start command: `node server.js`
6. Copy the Railway backend URL

### Frontend → Vercel

1. Import repository on Vercel
2. Set root directory to `frontend/`
3. Set environment variable: `VITE_API_URL=<your_railway_backend_url>`
4. The `vercel.json` handles React Router rewrites
5. Deploy!

---

## API Reference

```
POST /api/auth/register
POST /api/auth/login
GET  /api/users/me
GET  /api/users/search?email=...

POST   /api/groups
GET    /api/groups
GET    /api/groups/:id
POST   /api/groups/:id/members
DELETE /api/groups/:id/members/:userId
GET    /api/groups/:id/balances

POST   /api/groups/:id/expenses
GET    /api/groups/:id/expenses
GET    /api/expenses/:id
DELETE /api/expenses/:id

POST /api/groups/:id/settlements
GET  /api/groups/:id/settlements

GET  /api/expenses/:id/messages
```

Socket.io events: `join_expense`, `send_message`, `receive_message`

---

## AI Tool Used

This project was built with **Claude** (Anthropic) as the primary coding assistant.

See [AI_CONTEXT.md](./AI_CONTEXT.md) for the full source of truth document that another AI could use to recreate this app.

---

## Known Limitations

- JWT stored in localStorage (XSS risk, acceptable for demo scope)
- No expense editing (create + delete only)
- No multi-currency (INR only)
- No email verification
- No pagination on expense lists
- `sequelize.sync({ alter: true })` used in dev (use migrations for production)
