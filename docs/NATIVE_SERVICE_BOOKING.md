# Native customer service booking

Implemented in `user-app/` and the existing backend on 2026-10-27. This replaces the prototype-only status of the service detail flow. The native app retains the current authentication and five-tab navigation. Visual refinements can continue independently.

## Customer flow

1. Search for a vendor, occasion or service, or start a named event. Home uses compact red styling and live catalog data.
2. Open a vendor. Its Services tab links each service and performer to native detail editing; the estimate builder also exposes these links.
3. Choose One service or Multiple services. A standalone multi-service request does not automatically create an Event. Existing events can still group independent vendor requests.
4. Open a service detail sheet. It shows the vendor description when provided, catalog rate/unit, occasion and guest context, quantity and service-specific preference fields. Fixed/event services and performers use quantity one. Plates, hours and days are editable.
5. Add or save. Each service and performer retains its own preferences; closing without saving discards the draft. Deselecting excludes the item from the request. Switching linked events clears prior selections/preferences.
6. The API calculates a fresh itemized estimate. Review includes service quantities, preferences, artists and request notes. Send booking request retains existing quote fingerprint and idempotency checks.
7. The saved customer booking detail and vendor leads API show the stored preference snapshot. These are requests for vendor confirmation, not confirmed inclusions or payments.

## Fields and persistence

`ServiceRequirements` uses optional string fields `menu`, `meal`, `requests`, `theme`, `area`, `setup`, `start`, `coverage`, `format`, `look`, and `layout`. The client presents relevant fields by service type and adapts guidance to the occasion. Any custom occasion is accepted. The API validates allowed keys and string lengths; requested times use `HH:mm`. Requirements are normalized, included in the quote fingerprint, and persisted under each selected service/artist. Optional `occasion` also persists without an event container.

Backend additions are optional and keep prior request payloads valid. Existing bookings lacking preferences still render. The vendor catalog remains authoritative for all prices; customer preferences never set prices.

## Configuration

Use the existing setup in [customer README](../user-app/README.md) and [backend README](../backend/README.md). Runtime endpoints belong in ignored `user-app/.env` and database/provider configuration in ignored `backend/.env`. No new native dependency or database migration is required.

For physical-phone testing, configure the phone's platform API URL to a reachable LAN or hosted backend before bundling. Android emulator `10.0.2.2` and iOS simulator loopback address the development computer only.

## Verification

- `npm run typecheck` and `npm run lint`: passed.
- Backend `npm run check` against a generated, isolated MongoDB database: 2 tests passed, no skips. The integration suite covers independent preferences, trimmed values, invalid fields/times, server totals, persistence, customer ownership, vendor visibility, quote changes and idempotent retries. The temporary database was dropped by cleanup.
- `npx expo export --platform all`: Android and iOS Hermes bundles exported successfully to `/private/tmp/evently-services-native-export`.
- `./gradlew :app:assembleRelease`: passed (450 tasks, 4m 34s). Installable APK: `user-app/android/app/build/outputs/apk/release/app-release.apk` (about 84 MB). It embeds the JavaScript bundle and uses the project's existing debug signing configuration for internal testing. It is configured for the development backend and is not a store-signed production build.
- Packaged-APK installation was attempted but the emulator reported insufficient internal storage. Only QA-generated screenshots and regenerable caches were cleared; app data was preserved. Packaged launch is therefore unverified. The Android interaction evidence above comes from the updated native development build.
- Android native development build: Home, service detail editing, Multiple services, server estimate and request review inspected on Pixel 9a. Confirmed 60 plates × ₹850 + Stage Decor ₹35,000 = ₹86,000; Vegetarian/Dinner preferences survived the estimate round trip and appeared in review. No real booking was submitted from the user's emulator session.
- Visual evidence: [Home](verification/native-services/android-home.png), [catering details](verification/native-services/android-catering-details.png), [request review](verification/native-services/android-review.png).
- iOS launch was attempted; an existing “Open in Evently?” alert blocked interaction. The bundle compiles, but the new service flow is not yet interactively verified on iOS.

## Remaining scope

Vendor app UI, real availability, counter-quotes, payments and notifications remain pending. The vendor leads API already returns the new structured preferences. Native dark-mode polish and complete device-size/keyboard/accessibility QA remain pending. Google/Apple provider credentials and SMTP setup are still needed for live provider authentication/recovery.

The BMAD runner was unavailable (`_bmad/scripts/render_skill.py` missing). No BMAD setup or orchestration was claimed; implementation and verification were performed directly.
