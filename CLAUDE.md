# CLAUDE.md

## Project Overview
Event Management System with 3 parts:
- `backend/`: Node.js, Express, MongoDB, Mongoose REST API
- `user-app/`: React Native (Expo) app for Attendees / Clients
- `vendor-app/`: React Native (Expo) app for Vendors / Event Service Providers

## Core Reference Files
- Master Context: `PROJECT_CONTEXT.md`
- AI Instructions: `AGENTS.md`
- Database & Models: `docs/DATABASE_SCHEMA.md`
- Progress & Tasks: `docs/ROADMAP.md`

## Build & Run Commands
- Backend: `cd backend && npm run dev`
- User App: `cd user-app && npx expo start`
- Vendor App: `cd vendor-app && npx expo start`

## Coding Standards
- Cross-platform: All mobile code must run seamlessly on both Android and iOS.
- REST API standard: Return `{ "success": boolean, "message": string, "data": any }`.
- Error handling: Always use structured async/await with try-catch and status code handling.
- Documentation: Keep `docs/ROADMAP.md` updated as tasks progress.

