# Customer app

React Native and Expo SDK 58 customer app for Android and iOS.

Native vendor-service booking now supports one or multiple services, editable per-service preferences, artist requests, server-priced review and persisted booking details. See [implementation and verification](../docs/NATIVE_SERVICE_BOOKING.md). The compact customer UI uses the requested red theme; further visual polish remains separate.

## Setup

1. Run `npm install` in `user-app/`.
2. Copy `.env.example` to `.env`. The defaults connect the iOS simulator and standard Android emulator to a backend running on this computer. For a physical device, set the platform-specific `EXPO_PUBLIC_API_URL_IOS` or `EXPO_PUBLIC_API_URL_ANDROID` to an address the device can reach. `EXPO_PUBLIC_API_URL` is a fallback when no platform-specific URL is set. Include `http://` or `https://` and the backend port; do not add `/api`.
3. Start MongoDB and the backend, then run `npm start` in `user-app/`.

For an iOS simulator, `http://127.0.0.1:4000` reaches a backend on the same Mac. For the standard Android emulator, `http://10.0.2.2:4000` reaches the host computer. A physical phone needs the computer's LAN address and the same network. Use HTTPS for production deployments. Reload the app after changing `.env`.

Android builds allow cleartext traffic only when `EXPO_PUBLIC_API_URL_ANDROID` points to a local or private-network HTTP address for testing. Set a public HTTPS URL for production, which disables cleartext traffic. Rebuild the native app after changing this native network policy.

The app signs in through `/api/auth/user/login` or registers through `/api/auth/user/register`, then stores the JWT and returned account in AsyncStorage. Vendor search is public; estimates, bookings, and events require the customer JWT. Vendor prices and estimate totals always come from the backend. The estimate advance is a requested amount; this app does not collect payments.

## Google and Apple sign-in

Create native OAuth client IDs for the app identifiers in `app.json`. Set `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` in `user-app/.env`, and add both comma-separated IDs to `GOOGLE_CLIENT_IDS` in `backend/.env`. For Apple, enable Sign in with Apple for the iOS bundle identifier and set the same identifier as `APPLE_CLIENT_ID` in `backend/.env`. Rebuild the native app after changing entitlements, schemes, or app identifiers. The backend verifies provider JWT signatures, issuer, audience, expiration, and Apple nonce before issuing an Evently JWT. Google sign-in is offered on Android and iOS; Apple's native sign-in is offered on iOS when available. Provider sign-in requires live developer configuration and is not validated by the local API integration tests.

## Password recovery

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` in `backend/.env` to enable reset emails. `APP_RESET_URL` defaults to `eventlycustomer://reset-password`. The app opens this link into its reset screen. Reset links expire after 15 minutes and can be used once. Without SMTP configuration, the request screen shows a clear unavailable message.

Run `npm run typecheck`, `npm run lint`, and `npx expo-doctor` for static checks. `npx expo export --platform ios` and `--platform android` verify that both bundles compile. Device and simulator interaction still needs manual QA before release.
