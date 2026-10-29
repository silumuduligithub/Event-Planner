# Event Planner API

Requires Node.js 20+ and MongoDB. Copy `.env.example` to `.env`, set a unique `JWT_SECRET` of at least 32 characters, and set `MONGODB_URI` to a local or Atlas database. Then run:

```sh
npm install
npm run dev
```

`GET /health` returns the API health response after MongoDB connects. API routes are mounted in `src/app.js`. All responses use `{ "success", "message", "data" }`.

Events accept any nonempty occasion name in `eventType`; `occasionKey` normalizes common aliases such as Marriage/Wedding and Ring Ceremony/Engagement. `GET /api/vendors?occasion=Ring%20Ceremony` ranks matching vendors first and includes general-purpose vendors. Known occasion phrases also work through `search`. Vendor profiles can set `supportedOccasionKeys` and `acceptsCustomOccasions`; all listed services remain visible. The estimate response includes a `quoteFingerprint`. Send it as `expectedQuoteFingerprint` with a UUID `requestKey` when creating a booking to require price review after catalog changes and make retries idempotent.

To create sample data in a **nonproduction** database, set a `SEED_PASSWORD` of at least 12 characters in `.env` and run `npm run seed`. The script creates one demo customer, one vendor in each of the 11 vendor categories, and one event in each of the 7 event types. The customer login is `demo.client@example.test`. Vendor login emails are listed in `src/scripts/demoData.js`. The configured seed password applies to all demo logins and is refreshed on every run. Existing demo catalog details and events are preserved; empty demo galleries are filled. Other accounts are untouched. The sample portfolio photos are reused illustrative event images bundled under `public/demo`, served through `/demo-media`; the API returns absolute photo URLs based on the host used to call it.

`npm run check` runs syntax and model tests. For route integration tests, provide a disposable, dedicated database with `TEST_MONGO_URI=mongodb://127.0.0.1:27017/event_planner_route_test npm run check`; the integration test drops that database afterward.

Estimate tax and advance rates are configured with `ESTIMATE_TAX_RATE` and `ESTIMATE_ADVANCE_RATE` as decimal fractions. Tax defaults to zero until the applicable tax policy is configured. No payment is collected by this API.
