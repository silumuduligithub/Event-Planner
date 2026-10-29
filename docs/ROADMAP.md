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
- [x] Initialize Node.js + Express project with package.json & dependencies
- [x] Setup MongoDB connection via Mongoose (`src/config/db.js`)
- [x] Define Mongoose models for users, vendors, events, bookings, and reviews
- [x] Verify API startup against a running MongoDB instance through route integration tests
  - [x] Local Atlas `event_planner` configuration and `/health` startup verified on 2026-10-26; credentials remain in ignored `backend/.env`
- [x] Implement JWT Authentication & Password Hashing
  - [x] User register & login
  - [x] Vendor register & login
  - [x] Auth & Role verification middlewares (`protectUser`, `protectVendor`)
- [x] Implement User profile and saved-vendor routes & controllers
- [ ] Implement Vendor routes & controllers (Profile, Services, Portfolio)
  - [x] Public search/detail and vendor-owned profile, services, artist roster, portfolio URL updates
  - [ ] Dashboard statistics endpoint
- [x] Implement Event routes & controllers (Event CRUD)
- [ ] Implement Booking & Lead management routes & controllers
  - [x] Server-priced estimate, booking request, user/vendor lists, vendor status transitions
  - [ ] Vendor counter-quote endpoint
- [x] Implement completed-booking Review & Rating system
- [x] Add Zod input validation and centralized error handling for implemented routes
- [x] Setup guarded, repeatable seed script for demo user, vendors, and event
  - [x] Expand demo seed to every vendor category and event type, with service menus, artist rosters, checklists, and bundled sample portfolio images

---

## Phase 3: User Mobile App (`user-app/` — React Native)
- [x] Initialize React Native (Expo SDK 58) project for User App
- [x] Setup Navigation (Auth Stack, Bottom Tabs: Home, Events, Bookings, Profile)
- [x] Implement API client with Axios and AsyncStorage token persistence
  - [x] Configure local iOS simulator and Android emulator API URLs, with a shared URL override for physical devices
- [ ] Screens:
  - [ ] Splash & Onboarding / Login / Signup
    - [x] Login and signup with persisted customer session and error handling
    - [x] Friendly inline auth validation and error notices for invalid details, existing accounts, and connection failures
    - [x] Google/Apple identity-token sign-in flows and native client configuration hooks (live provider credentials still required)
    - [x] Password recovery request/reset routes and linked mobile screens; SMTP delivery configuration still required for live emails
    - [x] Customer welcome screen with event photography and reference-inspired auth styling
    - [x] Evently customer logo applied to welcome, app icon, and splash configuration; auth forms retain reference-style minimal headings
    - [x] Reference-inspired splash entry and three onboarding panels with event photography
    - [ ] Native splash timing and release-build polish
  - [x] Home Screen: category pills, city/search filters, and vendor cards from API
  - [x] Reference-inspired home, category artwork, separate vendor listing and Search tab using live catalog data
  - [x] Vendor Details Screen: Portfolio gallery, packages/services, reviews, "Book / Request Quote" button
    - [x] Portfolio, services, artist roster, prices, and estimate CTA
    - [x] Reviews display and completed-booking review submission
  - [x] Dynamic estimate builder with service quantities, artist add-ons, server pricing, and booking request
    - [x] Compact vendor summary and dark estimate total dock styled after supplied reference
  - [x] Event Planner Screen: Create & manage events (Date, Budget, Checklist)
    - [x] Create and list events with date, city, budget, and guest count
    - [x] Event detail, budget tracking, and editable checklist
  - [x] Bookings Screen: Active & Past booking status tracking, details, cancellation, and reviews
  - [x] User Profile, editing, saved vendors, and logout
  - [x] Search/listing filters and sort, vendor favorites, event and booking detail navigation
- [ ] Test cross-platform responsiveness on Android & iOS
  - [x] TypeScript, Expo lint, Expo Doctor, iOS and Android bundle exports; iOS login screen launched in simulator
  - [x] Evently native builds launched on iPhone 17 Pro and Pixel 9a simulators; welcome screen and launcher icon visually checked on both; Android login and signup visually checked
  - [x] Customer welcome, login, and signup layouts refined against supplied reference; refreshed welcome visually checked on iPhone 17 Pro and all three screens on Pixel 9a
  - [ ] Full Android and iOS interaction and device-size QA
  - [x] Revised Home and Profile screens visually inspected on Pixel 9a emulator; Android and iOS bundles exported
  - [x] Updated Android native development build assembled and launched on Pixel 9a; refreshed login and splash visually checked
  - [x] Updated iOS native development build assembled and launched on iPhone 17 Pro with Apple authentication module linked; splash visually checked
  - [x] Android emulator API transport verified against the running backend: a dummy reset token received the backend's invalid-link response after platform URL precedence and development HTTP policy fixes
  - [x] Android reset deep link opened the reset screen; iOS registered the custom scheme and prompted to open Evently
  - [x] Expo Doctor 20/20 checks passed after deduplicating native dependencies
  - [x] Flexible booking Home, Plan Event form, vendor list, one-service estimate, and request review visually inspected on Pixel 9a emulator; category chip clipping fixed
  - [ ] Flexible booking end-to-end interaction on iOS and Android, including event creation and submission, remains to be verified

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

## Flexible Event Booking Design
- [x] Document single-service and selectable full-event journeys, UX states, data model, API changes, and acceptance scenario (`docs/BOOKING_EXPERIENCE_DESIGN.md`)
- [x] Support open-ended occasion names and common aliases in Event API, vendor search, and customer event creation
- [x] Add vendor occasion coverage and relevant-first service ordering while returning each vendor's full menu; demo vendor tags seeded
- [x] Add Plan an event / Book one service entry points, explicit booking intent, itemized request review, and event-linked vendor requests in customer app
- [x] Add server quote fingerprint checks and idempotent booking request keys; customer app reviews changed estimates before retrying
- [x] Group independent vendor bookings under one event and label totals as requested estimates, without implying confirmation or payment
- [ ] Vendor app catalog/lead screens, real availability, counter-quotes, payments, and full Android/iOS interaction QA

## Current configuration and verification limits
- Google and Apple sign-in need provider client identifiers in the app/backend environment and a native development or release build; live provider exchange has not been verified.
- Password recovery reset tokens, expiration, one-time use, and email screens are implemented; live email delivery needs SMTP configuration.
- No payment methods or payment collection are in scope for the customer app.

## Premium customer experience redesign (2026-10-26)
- [x] Research 10 Indian and international event marketplaces and record source-backed UX findings; independent citation spot-check completed
- [x] Generate an interactive premium mobile design covering discovery, occasion planning, vendor details, service selection, request review, and event tracking; editable source in `docs/design/prototype/`
- [x] Check preview interactions, narrow-screen layouts, keyboard focus, and light/dark appearance; 23 scripted checks plus narrow core-flow checks passed on 2026-10-27 (browser preview only)
- [ ] Apply the reviewed visual direction to the native customer app and complete Android/iOS QA
- [x] Revise the interactive design to the requested crimson-red theme; light/dark screenshots inspected and 23 preview checks passed on 2026-10-27
- [x] Refine the preview into a compact mobile app with 22px page headings, 16px section titles, compact vendor cards, and persistent navigation; 26 browser checks passed
- [x] Add occasion-aware service details, quantity controls and independent service requirements to the vendor selection preview; service choices persist through edit/review and remain isolated between events; 31 service-flow checks plus 26 baseline checks passed

## Native service booking implementation
- [x] Persist validated per-service and per-artist customer requirements and occasion in server-priced estimates and booking snapshots; isolated MongoDB integration passed
- [x] Implement native service detail editing, independent selections, review and saved booking details
- [x] Apply compact red customer app styling while retaining existing navigation and auth
- [x] Verify backend integration (2 tests, no skips), mobile lint/typecheck, Android/iOS bundle exports and Android native service-to-review interaction
- [x] Build an installable Android internal-test APK with bundled JavaScript (`user-app/android/app/build/outputs/apk/release/app-release.apk`)
- [ ] Complete iOS service-flow interaction QA and packaged-APK launch verification (simulator alert / Android emulator storage limits)

