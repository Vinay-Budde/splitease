# Project Scope: SplitEase (Splitwise Clone)

## Overview
This document outlines the exact scope for the SplitEase project. It defines the core functionality implemented, as well as features explicitly excluded to maintain a manageable MVP (Minimum Viable Product).

---

## ✅ In Scope (Implemented)

### Authentication & Users
- Email and password registration/login
- Secure authentication using JWT stored in `localStorage`
- Passwords hashed via `bcrypt`
- Initial-based avatars (no file upload)

### Group Management
- Create a new expense-sharing group with a name and description
- Add members to a group by email
- Remove members from a group
- Dedicated group dashboard showing members, expenses, and simplified balances

### Expenses & Splitting
- Add a new expense within a group (description, total amount, payer)
- Support for 4 split types:
  1. **Equal**: Split evenly among all group members
  2. **Unequal**: Specify exact amounts for each member (must sum to total)
  3. **Percentage**: Specify percentages (must sum to 100%)
  4. **Shares**: Specify share units (e.g., 2 shares for user A, 1 share for user B)
- Delete expenses (also removes associated splits)

### Balances & Debt Simplification
- Dashboard showing overall aggregated balance ("you owe", "you are owed")
- Group-specific balances using a **Greedy Debt Simplification Algorithm**
  - Consolidates complex debt graphs into a minimal number of transactions (e.g., A owes B, instead of A owes B and B owes C)

### Settlements
- Record settlements (payments) between two members to clear debts
- Settlements automatically update the simplified debt graph

### Real-Time Chat
- Per-expense comment thread
- Real-time message delivery via Socket.io

### UI / UX
- Dark mode glassmorphism design system
- Built with React, Vite, TailwindCSS
- Responsive layout suitable for web browsers

---

## ❌ Out of Scope (Excluded)

### Features Omitted
- **OAuth / Social Login**: No Google/Apple sign-in.
- **Email Verification / Reset**: No SMTP setup or "Forgot Password" flow.
- **Multi-currency**: Only supports INR (₹). Exchange rates add unnecessary complexity.
- **Push Notifications / Email Alerts**: No external notifications for new expenses or debts.
- **Expense Editing**: Expenses can only be created or deleted, not modified.
- **Profile Picture Uploads**: Avatars fall back to user initials.
- **Recurring Expenses**: Only one-time expenses are supported.
- **Categories & Tags**: No tagging expenses as "Food", "Travel", etc.
- **Pagination**: All records are fetched at once (or limited to a max count) instead of lazy loading.
- **Read Receipts**: Chat does not show "Seen" or "Typing" indicators.
- **Shareable Invite Links**: Group invites are strictly done by entering an email address.
- **Mobile App**: This is a web-only application (no React Native or mobile binaries).

---

## Tech Stack Scope
- **Frontend**: React 18, Vite, React Router v6, Axios, TailwindCSS (Vercel deployment)
- **Backend**: Node.js 18+, Express.js, Socket.io (Railway/Render deployment)
- **Database**: MySQL 8 with Sequelize ORM (Relational database only)
