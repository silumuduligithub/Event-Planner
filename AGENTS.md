# AGENTS.md — AI Guidelines & System Instructions

Welcome, AI Agent!
You are working on the **Event Management System** consisting of:
1. `backend/` — Node.js + Express + MongoDB REST API
2. `user-app/` — React Native (Android & iOS) for Customers
3. `vendor-app/` — React Native (Android & iOS) for Vendors/Organizers

---

## ⚡ Quick Start for AI
Before answering or writing any code, ALWAYS read:
1. `PROJECT_CONTEXT.md` (Project overview, tech stack, directory structure)
2. `docs/ROADMAP.md` (Current progress, tasks done, tasks pending)
3. `docs/DATABASE_SCHEMA.md` (MongoDB data models)

---

## 🛠 Tech Stack Conventions

### Backend (`backend/`)
- Runtime: Node.js (v20+ recommended)
- Framework: Express.js
- Database: MongoDB via Mongoose ODM
- Auth: JWT (JSON Web Tokens) with hashed passwords (bcryptjs)
- Validation: Joi or Zod for request payloads
- Pattern: Modular MVC (Routes -> Controllers -> Services -> Models)
- Status Codes: Use standard HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Response Structure:
  ```json
  {
    "success": true,
    "message": "...",
    "data": { ... }
  }
  ```

### Mobile Apps (`user-app/` and `vendor-app/`)
- Framework: React Native with Expo (cross-platform Android & iOS)
- Navigation: React Navigation (Stack + Bottom Tabs)
- State Management: Lightweight (Zustand or React Context + Hook pattern)
- Network: Axios with central interceptors handling JWT storage
- Design & Styling: Clean, responsive styling using `StyleSheet.create`, supporting dark/light modes and `SafeAreaView`.

---

## 📌 Critical AI Guidelines
1. **Never break Android/iOS compatibility**: Avoid platform-exclusive APIs without cross-platform fallbacks.
2. **Do not hallucinate APIs**: Check `docs/DATABASE_SCHEMA.md` and existing routes before introducing new endpoints.
3. **Always Update `docs/ROADMAP.md`**: When completing or starting tasks, update the checkboxes in `docs/ROADMAP.md`.
4. **Clean Code**: Use descriptive variable names, proper error handling (try/catch with logging), and TypeScript/JSDoc annotations.

