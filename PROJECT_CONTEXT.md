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

## 4. Business Logic & Core Workflows

### A. Dual Booking Paradigms
1. **Dynamic Custom Package / Event Planner Mode**:
   - User plans an entire event (Marriage, Birthday, Corporate, etc.).
   - Selects an Event Planner or Mega Vendor.
   - Checks/unchecks specific services offered by that planner (e.g. Stage + Catering + DJ + Decor).
   - Generates an **instant itemized dynamic estimate** (Real-time calculation based on guests/items).
2. **Standalone Single Service Mode**:
   - User only needs one specific service (e.g., only a Photographer/Cameraman, only a Mehendi artist, or only Sound & Light).
   - Can directly book the single service instantly with customized dates and hours.
3. **Entertainment & Celebrity / Orchestra Booking**:
   - Booking full Orchestras, Melody Bands, DJ sets.
   - Booking **Featured Celebrities / Star Performers / Singers / Anchors** (either standalone or as part of an orchestra troupe roster).

### B. Supported Service Categories
- **Full Event Planners**: Wedding, Birthday, Corporate, Anniversaries, Concerts
- **Photography & Cinematography**: Candid, Drone, Pre-wedding, Traditional
- **Entertainment & Music**: Orchestra, Melody Troupes, Live Bands, DJ, Sound & Lighting
- **Celebrity & Artist Booking**: Star Singers, Dancers, Anchors/MCs, Standup Comedians, Special Guests
- **Decor & Venues**: Stage Decoration, Floral, Banquet Halls, Lawns, Farmhouses
- **Food & Catering**: Veg/Non-Veg buffets, live counters, dessert stalls
- **Personal Styling**: Bridal Makeup, Groom Styling, Mehendi Artists
- **Staffing & Extras**: Bouncers/Security, Valet, Priests/Pandits

---

## 5. User Personas & App Features

### A. End-User App (Customer / Client)
- **Home & Exploration**: Filter by Category, Location, Budget, Reviews.
- **Dynamic Estimate Generator**: Add/remove services from an Event Planner to see live total & cost breakdown.
- **Celebrity & Band Showcase**: Listen to audio clips, watch performance video teasers, view booking rates.
- **Direct & Custom Inquiries**: Send custom requirements, negotiate/accept quotes, pay booking advance.
- **Event Timeline & Tracker**: Countdown, checklist, linked bookings.

### B. Vendor App (Service Provider / Organizer / Artist Manager)
- **Service & Menu Management**: Add standalone services, bundled packages, and individual item rates.
- **Artist & Celebrity Roster**: For Orchestras and Agencies to add team members/celebrity performers with individual pricing.
- **Estimate & Quote Builder**: Send modified quotes or custom pricing when user requests custom requirements.
- **Booking Calendar & Leads**: Accept/Decline leads, manage schedule conflicts, mark booking stages.
- **Earnings & Invoicing**: Payment tracking, advance received, pending dues.

---

## 5. Important Rules for Any AI Working on this Project
1. **Never break cross-platform compatibility**: React Native code must work on both Android and iOS out-of-the-box (use standard components, flexbox, react-native safe areas).
2. **Modular Architecture**: Separate controllers, routes, models, and services in the backend.
3. **Always Keep `docs/ROADMAP.md` Updated**: Whenever a feature is started or completed, update the roadmap immediately so future AI sessions or tools know the exact progress.
4. **Environment Variables**: Never hardcode secrets or URLs; use `.env` files with `.env.example` templates.

