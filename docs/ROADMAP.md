# Project Roadmap & Living State Tracker

This document tracks the live implementation status. **Any AI assistant working on this project must check off items as they are finished.**

---

## Phase 1: Project Setup & AI Context Layer
- [x] Create project specification & context documents (`PROJECT_CONTEXT.md`, `AGENTS.md`, `CLAUDE.md`)
- [x] Define system architecture & API map (`docs/ARCHITECTURE.md`)
- [x] Define MongoDB data schemas (`docs/DATABASE_SCHEMA.md`)
- [x] Setup roadmap & progress tracker (`docs/ROADMAP.md`)

---

## Phase 2: Backend Development (`backend/`)
- [ ] Initialize Node.js + Express project with package.json & dependencies
- [ ] Setup MongoDB connection via Mongoose (`src/config/db.js`)
- [ ] Implement JWT Authentication & Password Hashing
  - [ ] User register & login
  - [ ] Vendor register & login
  - [ ] Auth & Role verification middlewares (`protectUser`, `protectVendor`)
- [ ] Implement User routes & controllers
- [ ] Implement Vendor routes & controllers (Profile, Services, Portfolio)
- [ ] Implement Event routes & controllers (Event CRUD)
- [ ] Implement Booking & Lead management routes & controllers
- [ ] Implement Review & Rating system
- [ ] Add input validation (Joi/Zod) and centralized error handling middleware
- [ ] Setup seed script for test data (sample vendors, categories, events)

---

## Phase 3: User Mobile App (`user-app/` — React Native)
- [ ] Initialize React Native (Expo) project for User App
- [ ] Setup Navigation (Auth Stack, Bottom Tabs: Home, Events, Bookings, Profile)
- [ ] Implement API client with Axios and token persistence (SecureStore / AsyncStorage)
- [ ] Screens:
  - [ ] Splash & Onboarding / Login / Signup
  - [ ] Home Screen: Categories (Venues, Caterers, Photographers, etc.), Featured Vendors, Search Bar
  - [ ] Vendor Details Screen: Portfolio gallery, packages/services, reviews, "Book / Request Quote" button
  - [ ] Event Planner Screen: Create & manage events (Date, Budget, Checklist)
  - [ ] Bookings Screen: Active & Past booking status tracking
  - [ ] User Profile & Settings
- [ ] Test cross-platform responsiveness on Android & iOS

---

## Phase 4: Vendor Mobile App (`vendor-app/` — React Native)
- [ ] Initialize React Native (Expo) project for Vendor App
- [ ] Setup Navigation (Auth Stack, Bottom Tabs: Dashboard, Leads/Bookings, Services/Portfolio, Profile)
- [ ] Implement API client with Axios and token persistence
- [ ] Screens:
  - [ ] Vendor Login & Registration (Business category, address, phone)
  - [ ] Dashboard Screen: Stats (New inquiries, pending bookings, total earnings)
  - [ ] Leads / Bookings Screen: Accept or Reject requests, update booking stages
  - [ ] My Services & Portfolio: Add/edit packages, upload portfolio photos
  - [ ] Vendor Profile & Business Hours
- [ ] Test cross-platform responsiveness on Android & iOS

---

## Phase 5: Polish, Notifications & Deployment Prep
- [ ] Real-time updates / Push notifications (Firebase Cloud Messaging / Expo Notifications)
- [ ] End-to-end integration testing (User books -> Vendor receives & accepts -> User gets notified)
- [ ] Environment configs & deployment guide (Backend to Cloud / Render / AWS; Apps build via EAS)

