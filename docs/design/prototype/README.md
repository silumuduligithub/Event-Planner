# Premium UI design source

This is an interactive design preview, not the React Native application. It uses a sanitized copy of the existing demo catalog, makes no API calls, and never submits bookings. The final interaction explicitly says no request was sent.

The editable template and three compressed illustrative assets live here so the design survives temporary-file cleanup. The preview embeds its imagery and fits below 1 MB. It expects the Visualize host's Lucide icon library; fonts use Google Fonts with local fallbacks.

Build from the repository root:

```sh
node docs/design/prototype/build-preview.cjs /tmp/evently-premium-20261026/evently-mobile.html
```

To open directly on a demo vendor's service selection screen:

```sh
node docs/design/prototype/build-preview.cjs /tmp/evently-premium-20261026/evently-vendor-services.html --vendor-services
```

`service-details.js` supplies per-service customer preference controls inside the same preview closure. It uses actual demo rates and treats unprovided vendor inclusions as unknown. `verify-service-details.js` replays the service-specific journey through the Playwright tool.

For browser QA, use the installed Visualize skill's `scripts/render.py` to serve that fragment on loopback port 8767. `verify-preview.js` is the function consumed by the Playwright tool's `filename` argument. Its screenshots go to `docs/design/evidence/`; update the absolute screenshot prefix if the checkout moves.

See [design specification](../PREMIUM_UI_DESIGN.md), [research](../competitive-event-marketplaces-2026-10-26/research.md), and [verification](../PREVIEW_VERIFICATION.md). Native API binding, safe-area behavior and Android/iOS QA remain pending.
