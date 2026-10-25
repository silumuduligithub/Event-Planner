# PROJECT CONTEXT: Event Management System (Two Apps + Backend)

## 1. Project Overview
A complete Event Management & Vendor Marketplace platform consisting of:
1. **Backend**: Node.js + Express + MongoDB (Mongoose) REST API
2. **User Mobile App**: React Native (Android & iOS) for end-users to discover, book, manage events and vendors.
3. **Vendor Mobile App**: React Native (Android & iOS) for vendors/service providers (catering, decoration, photography, venue, DJs, etc.) to manage listings, bookings, quotes, schedules, and earnings.

---

## 2. Tech Stack & Decisions

| Layer | Technology | Key Libraries / Tools |
|---|---|---|
| **Backend** | Node.js (v20+) | Express.js, Mongoose (MongoDB ODM), JWT, bcrypt, dotenv, cors, Joi/Zod |
| **Database** | MongoDB | MongoDB Atlas / Local MongoDB, Mongoose ODM |
| **User App** | React Native (Expo SDK) | React Navigation, Axios / React Query, Zustand / Context API |
| **Vendor App** | React Native (Expo SDK) | React Navigation, Axios / React Query, Zustand / Context API |
| **Cross-Platform Target** | Android & iOS | Unified codebase with platform-specific checks only where necessary |

---

## 3. Architecture & Directory Layout

```text
event_planner/
├── AGENTS.md                  # Instructions for AI agents (Antigravity, Codex, Cursor)
├── CLAUDE.md                  # Instructions for Claude Code CLI
├── PROJECT_CONTEXT.md         # Master project blueprint & context (this file)
├── docs/                      # Architectural & API specifications
│   ├── ARCHITECTURE.md        # Detailed system design & flows
│   ├── DATABASE_SCHEMA.md     # MongoDB schemas & models reference
│   └── ROADMAP.md             # Living task & progress tracker
├── backend/                   # Node.js + Express + MongoDB REST API
│   ├── src/
│   │   ├── config/            # DB, environment configs
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth (JWT), validation, error handling
│   │   ├── models/            # Mongoose schemas (User, Vendor, Booking, Event, Review)
│   │   ├── routes/            # Express routes (auth, users, vendors, events, bookings)
│   │   ├── services/          # Business logic & integrations
│   │   └── utils/             # Helpers & constants
│   ├── package.json
│   └── server.js (or index.js)
├── user-app/                  # React Native mobile app for Users/Clients
│   ├── src/
│   │   ├── api/               # API clients & endpoints
│   │   ├── components/        # Reusable UI components
│   │   ├── navigation/        # Stack & Tab navigators
│   │   ├── screens/           # User screens (Home, EventPlanner, VendorList, Booking, Profile)
│   │   ├── state/             # Global state (auth, cart/booking)
│   │   └── utils/
│   └── package.json
└── vendor-app/                # React Native mobile app for Vendors/Organizers
    ├── src/
    │   ├── api/               # API clients & endpoints
    │   ├── components/        # Reusable UI components
    │   ├── navigation/        # Stack & Tab navigators
    │   ├── screens/           # Vendor screens (Dashboard, Leads, Bookings, Services, Earnings)
    │   ├── state/             # Global state (auth, profile)
    │   └── utils/
    └── package.json
```

---

## 4. User Personas & Core Workflows

### A. End-User App (Customer / Client)
- **Auth**: Signup, Login, Profile setup.
- **Event Planning**: Create events (e.g. Wedding, Birthday, Corporate, Anniversary) with dates, budget, guest count.
- **Vendor Discovery**: Search & filter vendors by category (Catering, Venue, Photography, Decor, Music, etc.), location, price, rating.
- **Booking & Quotes**: Request quotation, direct booking, manage booking status (Pending, Confirmed, Completed, Cancelled).
- **Reviews & Ratings**: Leave reviews and ratings after completed service.

### B. Vendor App (Service Provider / Organizer)
- **Auth & Onboarding**: Business registration, KYC/Verification, portfolio images, pricing tiers.
- **Service Listings**: Add & edit services offered, packages, equipment, terms.
- **Booking Management**: Accept/Decline leads and quote requests, view booking calendar.
- **Earnings & Analytics**: View revenue, completed bookings, upcoming schedules.
- **Communication**: Chat / Contact customer for booking requirements.

---

## 5. Important Rules for Any AI Working on this Project
1. **Never break cross-platform compatibility**: React Native code must work on both Android and iOS out-of-the-box (use standard components, flexbox, react-native safe areas).
2. **Modular Architecture**: Separate controllers, routes, models, and services in the backend.
3. **Always Keep `docs/ROADMAP.md` Updated**: Whenever a feature is started or completed, update the roadmap immediately so future AI sessions or tools know the exact progress.
4. **Environment Variables**: Never hardcode secrets or URLs; use `.env` files with `.env.example` templates.
