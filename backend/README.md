# Event Planner API

Requires Node.js 20+ and MongoDB. Copy `.env.example` to `.env`, set a unique `JWT_SECRET` of at least 32 characters, and set `MONGODB_URI` to a local or Atlas database. Then run:

```sh
npm install
npm run dev
```

`GET /health` returns the API health response after MongoDB connects. API routes are mounted in `src/app.js`. All responses use `{ "success", "message", "data" }`.

To create sample data in a **nonproduction** database, set a unique `SEED_PASSWORD` of at least 12 characters in `.env` and run `npm run seed`. The script preserves existing records with its demo email addresses. The demo login emails are `demo.client@example.test`, `planner@example.test`, `camera@example.test`, and `orchestra@example.test`. The same configured seed password applies to newly created demo accounts. Existing demo passwords are not changed on later runs.

`npm run check` runs syntax and model tests. For route integration tests, provide a disposable, dedicated database with `TEST_MONGO_URI=mongodb://127.0.0.1:27017/event_planner_route_test npm run check`; the integration test drops that database afterward.

Estimate tax and advance rates are configured with `ESTIMATE_TAX_RATE` and `ESTIMATE_ADVANCE_RATE` as decimal fractions. Tax defaults to zero until the applicable tax policy is configured. No payment is collected by this API.
