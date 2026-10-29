---
type: competitive
topic: Evently premium customer UI
decision: Generate an occasion-neutral mobile booking experience
source: official public websites and representative browser inspection
status: complete
updated: 2026-10-27
---

# Evently: premium experience research

Use two routes into one catalog: **plan an event** and **find a service**. Keep occasion, location and guest count visible when relevant, then move from visual vendor discovery to explicit service selection and itemized request review. These are design recommendations grounded in repeated public search patterns, not evidence of conversion uplift.

Ten relevant platforms were sampled, not every provider. Official page text was reviewed for all ten; the lead additionally inspected desktop screenshots of Meragi, Tagvenue and WedMeGood. Native apps, signed-in journeys, actual checkout, availability and service quality were not tested. Prices and ratings shown by competitors are publisher claims, not verified facts.

## Discovery and comparison

WedMeGood and WeddingWire India expose vendor/category and city search [1][2]. The Bash similarly starts with service/entertainer and event city [8]. This supports retaining a direct route for customers who only need photography, catering, an artist or another service.

BookEventz and VenueLook expose many occasion types alongside venue/service categories [4][5]. Peerspace accepts activity, location and optional date [6]; Tagvenue's primary search combines event type, guest count and location [7]. Evently should accept custom occasion text as well as presets. Do not make all customers fill a complete event plan before browsing.

WeddingWire, BookEventz and VenueLook expose useful comparison fields such as location, review count, capacity and rates [2][4][5]. Preserve price basis: per plate, per hour, per day and per event are not interchangeable. Evently only has some of these fields today; do not invent capacity, verified badges, response time or availability.

## Selection and confidence

Meragi's public page combines venue imagery with capacity and starting price, a city/destination choice and a quick-match budget range with stated assumptions [3]. GigSalad's marketing example puts performer, date/time, event description and total together [9]. These support a concise final review. Customizable service checkout was not tested.

Zola combines direct vendor search with optional guided discovery and planning navigation [10]. Planning should remain available without becoming a prerequisite for one-service requests. Evently's selectable service menu and multi-vendor event grouping come from the project requirements, not a claimed gap in competitors.

## Visual inspection and design implications

Meragi: large photographic background, soft coral accent, generous typography and a distinct search/planning card. Tagvenue: spacious neutral composition, large venue image and grouped search controls. WedMeGood: strong pink brand, image-led hero and dense navigation/directory content. These are direct desktop observations from this run; mobile applications may differ.

Our design inference: combine spacious photography and structured comparisons with a lighter mobile navigation. Use warm ivory surfaces, deep green actions and restrained terracotta accents. Serif display headings create an editorial tone; a sans-serif handles prices, forms and navigation. Keep one dominant action per step. Avoid repeated promotional badges, unsolicited urgency and large directory link walls.

## Recommended deliverable

The interactive design covers Explore, Plan event, Search/results, Vendor detail, Service selection, Request review, Event workspace, Saved vendors and Profile/settings. A locally simulated request ends with an explicit preview notice; it does not create a real booking. Bind production implementation to existing API fields and lifecycle states. See [design specification](../PREMIUM_UI_DESIGN.md).

## Unresolved questions and scope

- Public marketing cannot establish booking quality or a superior conversion rate. No ranking of platforms is made.
- No customer usability study has been run. Observe users completing one-service and custom-occasion tasks before asserting usability improvements.
- Real vendor imagery is still required for production. The preview reuses existing illustrative project images and demo catalog entries.
- Native implementation and Android/iOS device QA are separate pending steps, not proved by browser preview checks.
- This is a focused comparison with manually maintained artifacts; unavailable local BMAD orchestration scripts were not run.

## Sources

All pages accessed 2026-10-26. Original publication dates unspecified. Confidence is high for directly seen UI elements, medium for design recommendations; underlying marketing capabilities remain unverified. Discovery patterns were cross-checked across independent publishers. No traction or market-share assertions are used.

| Ref | Supports | Publisher / source | Publication date | Accessed |
| --- | --- | --- | --- | --- |
| [1] | Vendor and city search; dense visual directory | [WedMeGood](https://www.wedmegood.com/) | Unknown | 2026-10-26 |
| [2] | Comparable vendor card fields | [WeddingWire India](https://www.weddingwire.in/wedding-vendors?cmp=B2C) | Unknown | 2026-10-26 |
| [3] | Image-led layout; qualified estimate assumptions | [Meragi](https://www.meragi.com/) | Unknown | 2026-10-26 |
| [4] | Cross-occasion filters and per-person pricing | [BookEventz birthday listings](https://www.bookeventz.com/banquets/mumbai/birthday-party) | Unknown | 2026-10-26 |
| [5] | Occasion navigation and distinct rate units | [VenueLook birthday listings](https://www.venuelook.com/birthday-party-venues-in-delhi) | Original unknown; page displays 2026-10-24 | 2026-10-26 |
| [6] | Activity/location/date discovery | [Peerspace](https://www.peerspace.com/) | Unknown | 2026-10-26 |
| [7] | Event/guest/location search and visual hierarchy | [Tagvenue](https://www.tagvenue.com/) | Unknown | 2026-10-26 |
| [8] | Service-first route | [The Bash](https://www.thebash.com/) | Unknown | 2026-10-26 |
| [9] | Public quote-summary demonstration | [GigSalad](https://www.gigsalad.com/) | Unknown | 2026-10-26 |
| [10] | Optional guided planning and direct search | [Zola](https://www.zola.com/wedding-vendors) | Unknown | 2026-10-26 |

These are current-page snapshots. Recheck interface/capability observations before production work if more than three months elapse (2027-01-26); no competitor pricing is used in the design.
