# Prompt 02 — Changes & Follow-up Instructions During Build

**Date**: 2026-06-14  
**Tool**: Claude (claude.ai)

This file documents all changes, corrections, and follow-up instructions given to the AI after the initial build prompt.

---

## Change 01 — MySQL Connection Error

**Prompt sent**:
```
PS C:\splitwise\backend> npm start
❌ Failed to start server: ConnectionRefusedError [SequelizeConnectionRefusedError]
```

**Cause**: MySQL service was running but `.env` still had placeholder password `yourpassword`.

**Resolution**: Updated `backend/.env` with the real MySQL root password. Also created `setup-db.js` helper script to auto-create the `splitwise` database.

---

## Change 02 — MySQL Access Denied Error

**Prompt sent**:
```
❌ Failed to start server: AccessDeniedError [SequelizeAccessDeniedError]:
Access denied for user 'root'@'localhost' (using password: YES)
```

**Cause**: Wrong root password entered in `.env`.

**Resolution**: Provided step-by-step guide to reset MySQL root password using `--init-file` method on Windows (requires Admin PowerShell). Updated `.env` to use `DB_PASS=Splitwise@123` to match the reset password.

---

## Change 03 — Push to GitHub

**Prompt sent**:
```
https://github.com/Vinay-Budde/splitease
push it into this github repo
```

**Resolution**:
- Ran `git init` (repo was already initialized with remote set)
- Updated `.gitignore` to ensure `.env` files are excluded
- Staged all 69 source files
- Created initial commit: `feat: initial SplitEase implementation`
- Pushed to `origin main` → `https://github.com/Vinay-Budde/splitease`

**Files NOT pushed** (gitignored):
- `backend/.env` (contains DB password)
- `frontend/.env`
- All `node_modules/` directories
- `dist/` build output

---

## Change 04 — Documentation Update

**Prompt sent**: Request to add:
- Product Research section to BUILD_PLAN.md (key Splitwise workflows + assumptions)
- AI Collaboration Process section to BUILD_PLAN.md (tools, Q&A process, key decisions)
- Detailed testing plan to AI_CONTEXT.md (11 manual test cases)
- `/prompts` folder with `01_initial_prompt.md`, `02_changes.md`, `03_ai_responses.md`

**Resolution**:
- Updated `BUILD_PLAN.md`: expanded Product Research with 7 workflows + 9 assumptions; rewrote AI Collaboration section with Q&A history and decision table; marked all completed build steps ✅
- Updated `AI_CONTEXT.md`: replaced sparse testing section with 11 numbered test cases; updated Implementation Log; updated prompts section
- Created `prompts/` folder with this archive

---

## Build Corrections Made (Code Level)

| File | Issue | Fix |
|------|-------|-----|
| `frontend/src/index.css` | `@import` order: Google Fonts must precede Tailwind | Moved font import to line 1 |
| `frontend/src/pages/GroupDetail.jsx` | Used dynamic `import()` inside `loadSettlements()` for `settlementAPI` | Changed to static import at top of file |
| `backend/.env` | Placeholder password `yourpassword` | Updated to real credential |
