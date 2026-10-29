# Premium preview verification

Verified 2026-10-27 in Chromium through Playwright. The previous run stopped at a usage limit before its interaction test executed; this run resumed at that step. The user subsequently requested a red theme: the 23 scripted checks were rerun successfully against the crimson revision, and all screenshots were regenerated. Light and dark Explore screens were visually inspected after that revision.

## Results

26 scripted checks passed after the compact mobile revision, with no JavaScript runtime errors during the tested flow. Additional assertions cover the 22px maximum page heading, 16px section headings and bottom-navigation placement. [Machine-readable results](evidence/preview-checks.json) and [replay function](prototype/verify-preview.js) are retained.

- Gallery navigation and truthful empty reviews.
- Disabled continuation for empty service selection; focus retained after checkbox changes.
- Stage Decor + 60 Catering Buffet plates + two hours of Event Lighting = ₹91,000. Review preserves every line and the total.
- One-service mode replaces the previous selection. Changing catering to 75 plates gives ₹63,750.
- Final preview explicitly states no real request was sent. Event grouping and checklist update locally.
- Adding another vendor retains occasion/date/city/guests. Save/unsave, empty results, Enter-key search, sorting and service filtering work.
- Dark appearance switches the product surface to its intended wine-black and rose-red palette.
- Explore has no horizontal overflow at outer browser widths 320, 390 and 736 px. The preview renderer reserves 32 px around the frame, so tested content widths were 288, 358 and 704 px (product width capped at 402 px).
- A long custom occasion wraps at narrow width. Additional checks covered Plan, Results, Vendor, Builder and Review at 288 px content width.

## Fixes made during verification

Native form submission was blocked by the preview sandbox. Preview actions now validate and handle forms locally, including Enter-key submission, without network calls. Selection rerenders retain keyboard focus. Event-linked city changes are blocked during the linked journey; unrelated navigation clears that context. Drafts carry event identity and repeated preview submission does not duplicate an identical draft.

Screenshots initially clipped at the renderer iframe boundary. The replay function grows the browser around the preview. The compact revision intentionally uses a 780px mobile viewport with internally scrolling content; screenshots capture that viewport with persistent navigation/action areas. Light, dark, service-builder, review and scrolled vendor screenshots were visually inspected.

## Visual evidence

- [Explore, light](evidence/explore-light.png)
- [Explore, dark](evidence/explore-dark.png)
- [Plan event](evidence/plan-event.png)
- [Vendor detail](evidence/vendor-detail.png)
- [Service builder](evidence/service-builder.png)
- [Request review](evidence/request-review.png)
- [Event workspace](evidence/event-workspace.png)
- [Compact vendor rows after scrolling](evidence/compact-vendors.png)

## Service-detail revision

Resumed after the usage-limit interruption and completed 31 service-flow checks plus all 26 existing baseline checks. [Service check results](evidence/service-detail-checks.json) and [replay function](prototype/verify-service-details.js) are retained. No runtime errors occurred in either tested journey.

Validated multiple selected services from one vendor, per-service quantities and independent preferences, saved edits versus discarded drafts, review/request snapshots, removal, one-service replacement, and isolation between separate events. Birthday and ring-ceremony prompts differ for the same decoration service. A service-first customer can choose several services and set an occasion without creating an event.

Verified ₹850 × 100 catering plates + ₹35,000 decor + ₹2,500 × 2 lighting hours = ₹1,25,000. Removing decor leaves ₹90,000. Checked the service detail at 288px content width and in dark appearance.

New visual evidence: [catering details](evidence/catering-service-details.png), [selected services](evidence/configured-vendor-services.png), [preferences in review](evidence/service-preferences-review.png), and [decoration details in dark mode](evidence/decoration-details-dark.png). The service view can open from either a vendor's menu or a selected service card.

Structured per-service preferences are local preview state. Backend/native persistence and vendor-facing consumption remain pending implementation. The demo uses actual seeded service rates; unsupported inclusions are explicitly left for vendor confirmation.

## Limits

This is an interactive HTML design proposal using illustrative project images and sanitized demo data. It does not change the current native UI or submit customer data. Browser checks do not establish React Native behavior, real availability, server pricing, authentication, payments, full screen-reader compatibility, or Android/iOS safe-area and keyboard behavior. Those remain native implementation/QA work.

No backend or native application source was modified in this redesign pass. Research citation markers matched all 10 appendix sources; independent semantic review found no unsupported load-bearing claims and its prose clarifications were applied.
