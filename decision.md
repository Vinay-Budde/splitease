# Key Architectural & Technical Decisions

This document logs the major technical and product decisions made during the development of SplitEase.

---

## 1. Monorepo Structure
**Decision:** Store both `/frontend` and `/backend` within a single GitHub repository.
**Rationale:** 
- Greatly simplifies version control for a solo developer or internship assignment.
- Both halves of the project can be pushed and deployed simultaneously.
- Shared `.gitignore` and root-level documentation keeps the project organized.

## 2. Database Choice: MySQL & Sequelize
**Decision:** Use a relational database (MySQL) via the Sequelize ORM instead of a NoSQL option like MongoDB.
**Rationale:** 
- The core of a bill-splitting app is fundamentally relational: Users belong to Groups, Expenses belong to Groups, and Splits belong to Expenses and Users.
- Strict foreign key constraints maintain data integrity (e.g., deleting an expense safely cascades to delete its splits).

## 3. Balance Algorithm: Greedy Debt Simplification
**Decision:** Use a greedy algorithm (O(n log n)) to simplify debts rather than aiming for the absolute theoretical minimum number of transactions (which is an NP-Hard problem).
**Rationale:**
- The greedy approach (pairing the largest creditor with the largest debtor repeatedly) is computationally fast and yields highly simplified debt graphs for typical group sizes (< 50 members).
- Building the NP-Hard perfect minimizer adds immense complexity with no noticeable benefit to the end user.

## 4. Real-time Chat: Socket.io on the Express Server
**Decision:** Attach Socket.io to the existing Express.js HTTP server instead of spinning up a separate dedicated WebSocket microservice.
**Rationale:**
- Reduces infrastructure overhead and deployment complexity.
- Fits perfectly within the scope of an MVP. 
- **Rooms:** Each expense has its own isolated `expense_{id}` Socket.io room, ensuring messages are only broadcast to the people viewing that specific expense.

## 5. Authentication: JWT in `localStorage`
**Decision:** Store the authentication JSON Web Token (JWT) in the browser's `localStorage` rather than HTTP-only cookies.
**Rationale:**
- Much easier to implement and test locally without dealing with complex cross-origin resource sharing (CORS) credentials and cookie-domain policies.
- A well-accepted standard for simplified, single-page application MVPs. 
- *Tradeoff:* Vulnerable to XSS attacks, but acceptable given the non-financial sandbox nature of this clone.

## 6. Split Calculation Rounding
**Decision:** When dividing amounts, the *last* member in the list absorbs any floating-point rounding remainder.
**Rationale:** 
- e.g., ₹100 split 3 ways yields ₹33.33 each, leaving ₹0.01 unassigned. Assigning the remainder to the last person ensures the sum of the splits *exactly* matches the total amount.
- Prevents database validation errors and decimal leakage.

## 7. UI/UX: Vanilla CSS + Tailwind
**Decision:** Use a hybrid approach of Tailwind utility classes and Vanilla CSS variables.
**Rationale:**
- A custom `index.css` establishes a global dark-mode, glassmorphism design system utilizing CSS variables.
- Tailwind handles spacing, flexbox layouts, and typography, keeping the React components clean without needing heavy component libraries like Material-UI.

## 8. Excluded "Editing" of Expenses
**Decision:** Users cannot edit an existing expense. They must delete it and recreate it.
**Rationale:**
- Editing an expense with complex custom splits requires a massive amount of state-reconciliation and differential database updates. 
- Deleting and recreating is mathematically safer and drastically reduces the surface area for bugs in the MVP.
