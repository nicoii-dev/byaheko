# ByaheKo

ByaheKo is a React Native CLI companion app for Philippine commuters. It helps
people discover nearby boarding points, compare demonstration routes, plan
trips with walking directions, and save the places and routes they use often.

> **Demonstration data only.** Routes, stops, fares, travel times, advisories,
> and notifications in this repository are sample data. They are not verified
> LTFRB records and must not be used for real travel decisions. The app does
> not provide live vehicle tracking or real-time arrivals.

## Highlights

- Splash, onboarding, login, registration, forgot/reset password, and email
  verification flows.
- Home dashboard with nearby stops, transport categories, popular routes, and
  service updates.
- Explore tab with a MapLibre/OpenStreetMap map showing backend routes as
  coloured polylines, route selection, destination search, boarding-point
  filters, and distance sorting.
- Transportation directory with per-vehicle route counts, boarding-point
  counts, fare ranges, and drill-down category pages.
- Trip planner that builds direct rides, one-transfer trips, and walking-only
  suggestions from the configured route graph.
- Route details, step-by-step navigation preview, and boarding-point details.
- Favorites, notifications, profile editing, settings, theme switching, legal
  pages, and an about screen.
- Light and dark Material Design 3 themes built on React Native Paper.
- AsyncStorage persistence for the session, favorites, theme, settings, and
  recent searches.

## Tech stack

| Area | Choice |
| --- | --- |
| Runtime | React Native CLI 0.88.1, React 19, TypeScript (strict) |
| State | Redux Toolkit, React Redux |
| Forms | React Hook Form, Yup, `@hookform/resolvers` |
| UI | React Native Paper, MaterialCommunityIcons |
| Navigation | React Navigation native stack + bottom tabs |
| Maps | MapLibre Native with OSM-derived CARTO basemaps (default); legacy Leaflet WebView and React Native Maps retained |
| Location | `@react-native-community/geolocation` |
| HTTP | Axios with a centralized client and interceptors |
| Storage | `@react-native-async-storage/async-storage` |
| Testing | Jest, React Test Renderer, Testing Library |

## Project structure

```
src/
  assets/fonts/            Nunito font
  components/              Reusable presentation components
    buttons/               AppButton
    cards/                 Boarding point, route, category, directory cards
    common/                Screen, headers, state views, banners, stat tiles
    inputs/                Text, password, phone, select, search inputs
    maps/                  MapLibreMap (default), OpenStreetMap (legacy), TransportMap (Google/Apple)
  config/                  Theme, constants, environment
  hooks/                   Generic hooks such as debounced values
  features/
    auth/                  Auth screens and Yup schemas
    onboarding/            Splash and onboarding screens
    home/                  Home dashboard
    explore/               Map and nearby boarding points
    directory/             Transportation directory and category details
    trip-planner/          Origin/destination selection and results
    routes/                Route, navigation, search, boarding point screens
    favorites/             Saved routes and places
    notifications/         Notification list
    profile/               Profile, edit profile, settings, legal, about
  navigation/              Root stack, tabs, typed navigation helpers
  redux/                   Store, hooks, selectors, slices
  services/
    api/                   Axios client and production API services
    mock/                  Clearly labelled demonstration services and data
    location/              Device permission and GPS helpers
    storage/               AsyncStorage helpers
    tripPlanner.ts         Pure route-planning engine
  types/                   Shared domain models
  utils/                   Geo, formatting, transport, and error helpers
```

Business logic lives outside screens: the trip planner is a pure function, the
mock services implement the same interfaces as the production clients, and
Redux thunks own persistence.

## Getting started

### Prerequisites

- Node.js 22.11 or newer
- A configured React Native development environment (Xcode/CocoaPods for iOS,
  Android Studio/SDK for Android)
- Watchman (recommended on macOS)

### Install

```sh
npm install --legacy-peer-deps
```

The legacy peer-dependency flag is currently needed because some packages in
the React Native ecosystem still declare React 18 peer ranges while this app
uses React 19.

### iOS

```sh
bundle install
cd ios && bundle exec pod install && cd ..
npm run ios
```

### Android

```sh
npm run android
```

### Native assets

Fonts and the MaterialCommunityIcons font are linked into both native
projects. Re-run this command after changing `react-native.config.js` or adding
fonts:

```sh
npx react-native-asset
```

The command updates `android/app/src/main/assets/fonts`, the iOS Xcode project,
and the `UIAppFonts` entry in `ios/byaheko/Info.plist`.

## Demo account and codes (mock mode only)

| Item | Value |
| --- | --- |
| Email | `juan@example.com` |
| Password | `Password123!` |
| Email verification code | `123456` |
| Password reset code | `123456` |

The demo account only exists when `BYAHEKO_USE_MOCKS=true`. New registrations
start unverified so the verification flow can be exercised, and the mock auth
service never sends real email.

## Configuration

Runtime configuration is read in `src/config/environment.ts`:

| Variable | Default | Purpose |
| --- | --- | --- |
| `BYAHEKO_API_URL` | `http://localhost:5050/api/v1` (iOS simulator)<br>`http://10.0.2.2:5050/api/v1` (Android emulator) | byaheko-api base URL |
| `BYAHEKO_APP_VERSION` | `1.0.0` | Displayed app version |
| `BYAHEKO_USE_MOCKS` | `false` | Set to `true` to use in-memory mock services |
| `BYAHEKO_MAP_STYLE_URL` | CARTO Positron (OSM) | MapLibre style URL for the light theme |
| `BYAHEKO_MAP_STYLE_DARK_URL` | CARTO Dark Matter (OSM) | MapLibre style URL for the dark theme |
| `BYAHEKO_GEOCODER_URL` | `https://photon.komoot.io/api` | Photon-compatible destination search endpoint |
| `BYAHEKO_DISABLE_API_LOGS` | `false` | Set to `true` to silence API request/response logs |

### API request logging

Every API call is logged to the console with a `[ByaheKo API]` prefix. Calls
through the shared Axios client are logged by its interceptors, including the
token-refresh request; the Photon geocoder logs its own calls. Requests show the
resolved URL, query params, and body; responses show the status code and
elapsed time; failures show the status, error code, message, and response body.
Passwords, tokens, and authorization headers are redacted, so the output is safe
to share. Set `BYAHEKO_DISABLE_API_LOGS=true` to turn logging off.

The app talks to the NestJS backend in `../byaheko-api` by default. Start it with
`npm run start:dev` (it listens on port `5050`). The default base URL already
accounts for the Android emulator's `10.0.2.2` host alias. On a physical device,
set `BYAHEKO_API_URL` to your machine's LAN address.

Metro does not inject arbitrary environment variables by itself. Supply these
through your build pipeline (for example a Babel transform or
`react-native-config`). When connecting to the real API, all authentication
flows use its `/api/v1/auth/*` endpoints, including email verification and
password reset.

### Authentication contract

The mobile client unwraps the API's `{ success, message, data, meta }` envelope
and stores both the access and refresh tokens. A `401` triggers a single token
rotation against `POST /auth/refresh`, then retries the original request. After
registration the user verifies their email and then signs in; verification does
not create a session.

## Native configuration

### Android location permissions

`android/app/src/main/AndroidManifest.xml` declares `ACCESS_FINE_LOCATION` and
`ACCESS_COARSE_LOCATION`. The app requests permission at runtime before reading
the device location and handles denied and permanently blocked states.

### First-run location confirmation

On a fresh install, completing (or skipping) onboarding opens a confirmation
screen that explains why ByaheKo would like to use location, before the
operating system's own permission dialog. Tapping **Allow location** requests
the device permission and reads the current fix; **Not now** skips it without
calling any location API. The choice is saved under
`STORAGE_KEYS.LOCATION_PROMPT_SEEN` (`@ByaheKo/location_prompt_seen`), so
returning users are never prompted again.

Approval is stored separately under `STORAGE_KEYS.LOCATION_ACCESS_ALLOWED`
(`@ByaheKo/location_access_allowed`). On every later launch the Splash screen
dispatches `restoreLocationAccess()`, which quietly re-reads the device location
without showing the OS dialog again. Home and Explore therefore use
`nearbyBoardingPoints` automatically — users who already allowed location never
have to press "Locate" or "Use my location" again. A revoked or blocked device
permission downgrades access and restores the manual "Use my location" prompt.
Users who chose "Not now" can still enable location later from those controls.

### OpenStreetMap maps (default)

Explore uses `src/components/maps/MapLibreMap.tsx`, powered by
`@maplibre/maplibre-react-native`. Routes come from the existing backend
`GET /api/v1/routes` endpoint; `src/utils/routeGeoJson.ts` converts each route's
`latitude`/`longitude` stop records into GeoJSON with `[longitude, latitude]`
coordinates. Each route is drawn as its own coloured line with origin,
destination, and intermediate stop markers. Tapping a line or marker selects the
route, frames it with `fitBounds`, and opens its details below the map. Boarding
points and the searched destination are also rendered on the same map.

The basemap defaults to CARTO's OSM-derived Positron/Dark Matter styles. These
are production CDN tiles and include OpenStreetMap attribution; no Google Maps
key is required. Override `BYAHEKO_MAP_STYLE_URL` /
`BYAHEKO_MAP_STYLE_DARK_URL` to use your own provider. Destination search uses
Photon (an OSM geocoder) by default; set `BYAHEKO_GEOCODER_URL` to a hosted,
production-grade provider with the same GeoJSON response shape before release.
The public community services are suitable for development and light use only.

Because MapLibre Native is a native module, rebuild the apps after installing
dependencies:

```sh
npm install
cd ios && bundle exec pod install && cd ..
npm run android   # or: npm run ios
```

Android autolinking handles the module during the next Gradle build. If you
switch the API or geocoder URLs, restart Metro with a cleared cache.

`src/components/maps/OpenStreetMap.tsx` (Leaflet in a WebView) is kept as a
legacy reference and is covered by its own test; it is no longer used by the
app screens. The original `TransportMap` (Google/Apple Maps) is likewise
retained for reference and is not used by default.

### Android Google Maps key (legacy TransportMap only)

`src/components/maps/TransportMap.tsx` retains the original React Native Maps
implementation. The app screens now use `OpenStreetMap`, so a Google Maps key is
only needed if you switch a screen back to `TransportMap` or render it
elsewhere. If you do, add the key to `android/gradle.properties` (do not commit
it):

```properties
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Alternatively, place it in `~/.gradle/gradle.properties`. The Gradle build
passes the value to the manifest placeholder declared in
`android/app/build.gradle`. Enable the **Maps SDK for Android** for the key in
the Google Cloud console.

iOS uses Apple Maps by default for `TransportMap`, so no Maps key is required
for that legacy component.

### iOS location usage

`ios/byaheko/Info.plist` includes a user-facing
`NSLocationWhenInUseUsageDescription`. Keep this text accurate if the location
behaviour changes.

### App display name

The visible name is **ByaheKo** on both platforms:

- `app.json` → `displayName`
- `android/app/src/main/res/values/strings.xml` → `app_name`
- `ios/byaheko/Info.plist` → `CFBundleDisplayName`

The internal React Native component name remains `byaheko` to match
`MainActivity.kt`.

## Scripts

```sh
npm start          # Start Metro
npm run ios        # Build and run iOS
npm run android    # Build and run Android
npm run lint       # ESLint
npm run typecheck  # TypeScript, no emit
npm test           # Jest
npm run pods       # Install CocoaPods dependencies
```

## Testing

The test suite covers:

- Yup validation schemas for login, registration, password reset, and email
  verification.
- The pure trip planner: walking-only, direct, transfer, inactive-route, and
  no-route cases.
- Nearby boarding-point filtering and distance ordering.
- Transportation-directory filtering, counts, and fare ranges.
- Directory category and route card rendering and press handling.
- Debounced search values, including cancellation when typing continues.
- Geo formatting, distance matching, and display helpers.
- Auth, favorites, and theme reducers.
- Mock auth, transportation, and routes services.
- OpenStreetMap WebView markup, required OSM attribution, marker press
  handling, and recenter visibility (legacy component).
- Route-to-GeoJSON conversion (`[longitude, latitude]` order, invalid/duplicate
  coordinate filtering, selected/dimmed styling, boarding and destination
  markers) and backend route response mapping.
- API logging output, including redaction of sensitive fields.
- A root-app smoke render.

```sh
npm test
npx tsc --noEmit
npm run lint
```

Jest mocks native modules that are not available in the Node environment:
gesture handler, Reanimated, AsyncStorage, safe-area context, vector icons,
React Native Maps, MapLibre React Native, React Native WebView, and geolocation.
See `jest.setup.js` and `jest.config.js`.

## Data and product guardrails

- All demonstration records live in `src/services/mock/data.ts` and are marked
  with `isDemoData` where the domain model supports it.
- The trip planner only uses configured routes and stops. It never invents a
  route, stop, fare, or travel time. If the graph cannot connect two points it
  returns an empty result.
- No live vehicle positions, ETAs, or real-time arrival data are implemented.
- Location permission denial and permanent blocking are handled explicitly in
  the first-run confirmation screen, the Explore flow, and Settings.
- Before release, replace the mock services with verified operator data and
  review every fare and route against the relevant LTFRB records.

## Known limitations

- The backend lives in `../byaheko-api`. It now exposes `GET /api/v1/routes`
  (with ordered stops and transportation types) used by the Explore map; no new
  tables or seed data were introduced. The geocoding endpoint is optional—the
  client falls back to Photon when `/geocode/search` is unavailable.
- The bundled Nunito file is a variable font. iOS uses its PostScript name
  (`Nunito-Regular`) and Android uses the family name (`Nunito`); verify both on
  a physical device when changing the font.
- The MapLibre map requires network access for the CARTO basemap style and
  tiles and for Photon geocoding; offline maps are not implemented. The default
  public providers are suitable for development and light use only—configure
  production URLs before release. The legacy Leaflet WebView component
  (`OpenStreetMap.tsx`) still depends on unpkg and the community OSM tile
  server, but is no longer rendered by any screen.
- Android release builds still use the debug signing configuration from the
  React Native template and must be replaced before distribution.
