# Evently premium customer UI

Status: service selection, detail editing, review, persistence and compact red Home have been implemented in the native customer app. Remaining visual polish and complete cross-platform interaction QA are tracked in `docs/ROADMAP.md`. Research: [ten-platform comparison](competitive-event-marketplaces-2026-10-26/research.md).

## Visual language

Revised 2026-10-27 at the user’s request: a crimson-red theme. Warm white background `#FFFAF8`, crimson primary `#B71935`, dark text `#25171C`, muted rose-gray `#78636B`, deep rose accent `#A3223B`. Red highlights primary actions, navigation, favourites and selected services; pale blush surfaces keep selection readable. The hero uses a burgundy overlay and the event card a burgundy-to-crimson gradient. Dark appearance uses wine-black surfaces `#1D1117` with rose-red controls `#FB7C90`. Color is paired with labels, icons and selection indicators.

The user rejected the oversized editorial treatment. Use DM Sans with system sans fallback throughout, including headings. Page titles are 20–22px, section titles 16px, vendor/service names 13–14px, body text 12–13px and supporting labels 11px. Remove decorative italic headings and replace promotional phrases with short task names. Production must bundle fonts or verify loading fallback and support device text scaling.

Spacing: 4/8/12/16/20. Primary actions are 46px high; compact chips are 40px. Card radius 12–14, input radius 10. Vendor lists use compact horizontal cards with an 82px thumbnail, name, category, location and price. The promotional banner is 138px high. Light borders replace ubiquitous shadows. No fake review counts, verification badges or availability promises.

The contained mobile preview is at most 402px wide and 780px tall. Its content scrolls independently between the header and persistent bottom navigation/action area. This deliberate phone-screen presentation replaces the previous long page. Content scroll position and keyboard focus survive selection changes; new screens begin at the top.

## Information architecture

Explore opens with brand/location, concise headline, search and an image-led event-planning entry. A separate service category grid provides direct access. Occasion shortcuts include wedding, birthday, ring ceremony, corporate and custom text. Browse results retain context; filter and sort controls are local to results.

Both routes converge on the same vendor details and service builder. Vendor details offer gallery, services and reviews; an unrated vendor explicitly has no reviews. Rates always include their unit. The user's selected items, quantities and estimated total remain together.

The preview proposes bottom navigation: Explore, Events, Saved, You. Requests remain available within an event and profile. Production route migration must preserve existing booking access, saved state, deep links and back navigation.

## Critical journeys

1. Single service: category/search → vendor → one-service mode → one selected service/artist → date and location → itemized review → booking request.
2. Whole event: preset or free occasion → name/city/date/guest count → relevant vendors → select any subset of that vendor's services → review → independent vendor request under the event.
3. Multi-vendor event: open event → add another vendor → preserve event date/city → create another independent request. No consolidated vendor confirmation is implied.
4. Save and return: heart toggle → saved vendors → detail; save failures must roll back in production.

## Preview interactions

Local state supports search, city/category filtering, price sorting, saved vendors, occasion presets/custom text, planning form, gallery, service/review tabs, one-vs-many selection, quantity editing, totals, review/back editing, local draft request, event checklist and appearance choice. All catalog values are demo seed values. No network calls or customer-account writes. A completion message explicitly states no booking was sent.

### Vendor services and service details

A vendor offers a full menu. Each service name opens its own detail screen from the vendor menu or builder. A checkbox selects it directly and reveals its description, occasion context, saved preferences and quantity. One-service mode replaces the prior selection; Multiple services mode allows any subset from the current vendor.

The detail screen shows the actual service rate and unit, the vendor's description when available, the chosen occasion and editable quantity. Requested preferences depend on service type: catering has menu/meal/dietary choices; decor has theme/setup/requirements; sound and lighting have timing/setup; photography has coverage/moments; albums have format/layout; venues have seating and space needs; styling has look and ready-by time; performers have timing and performance requests. Guidance adapts to birthday, wedding/ring ceremony and other/custom occasions. Preferences are customer requests, not confirmed vendor inclusions.

Save commits that service's quantity and preferences. Back discards unsaved edits. Review and local event-request drafts snapshot only selected services and their preferences. Removing a service removes it from totals and review without changing other selections. A separate event gets independent preferences. Standalone requests can specify an occasion without creating an event.

Structured per-service and artist preferences are now implemented in the native customer app and persisted by the API. Existing service IDs, quantities and request-level notes remain supported; optional `requirements` and `occasion` fields extend the contract. Server estimates, booking snapshots and vendor leads include the validated customer requirements. The native implementation retains the existing five tabs and service detail sheets, rather than replacing navigation with the prototype's four-tab proposal.

## Production binding and states

- Existing `vendorApi.list` and detail response supply cards and menus. Show empty/error/retry/skeleton states; no inferred inventory counts.
- Preserve occasion alias matching and full service menus, including custom occasions.
- Use the server estimate endpoint and expected quote fingerprint. A changed quote returns to review; request keys survive safe retries. Client arithmetic in the design is illustrative only.
- Keep event date and city locked for linked requests. Respect all existing server validation and authentication.
- In real UI use “Send booking request”; until accepted the state is “Requested estimate.” Do not imply payment, reservation, instant confirmation or availability.
- Show selected quantity next to rate unit. Do not invent tax/discount calculations. Unknown extra charges should be agreed with the vendor.
- Preserve artist selection as a distinct type, including performance pricing.
- Empty, offline, validation, pending save/submission, changed quote, duplicate retry and failed request must all receive native implementation checks.

## Validation target

Browser preview at 320, 390 and 736 CSS pixels; keyboard interaction, no horizontal overflow, light/dark appearance, long custom occasion text, empty results, one-service replacement and quantity totals. Native acceptance remains Android/iOS testing with dynamic text, safe-area insets, keyboard avoidance, back gestures and actual API requests.
