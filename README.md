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
- Explore tab with an OpenStreetMap-based map, boarding-point filters, and
  distance sorting.
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
| Maps | OpenStreetMap via Leaflet + `react-native-webview` (default); React Native Maps retained for Google/Apple Maps |
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
    maps/                  OpenStreetMap (default), TransportMap (Google/Apple)
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

### OpenStreetMap maps (default)

The map surfaces use `src/components/maps/OpenStreetMap.tsx`, which renders
Leaflet inside `react-native-webview` with free OpenStreetMap tiles. These
screens do not require a Google Maps API key. The component needs network access
to load Leaflet from unpkg and tiles from `tile.openstreetmap.org`.

After installing dependencies, rebuild the native apps so
`react-native-webview` is linked. On iOS, run `cd ios && bundle exec pod install`
before building. On Android, autolinking handles the native module during the
next Gradle build.

The map displays the required “© OpenStreetMap contributors” attribution. The
community tile server is intended for development and light use only. Review the
[OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/)
and change `OPENSTREETMAP.tileUrl` in `src/config/constants.ts` to a production
tile provider before shipping.

The original `TransportMap` remains available. Switch a screen's map import back
to `TransportMap` if you need the Google/Apple Maps implementation instead.

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
  handling, and recenter visibility.
- A root-app smoke render.

```sh
npm test
npx tsc --noEmit
npm run lint
```

Jest mocks native modules that are not available in the Node environment:
gesture handler, Reanimated, AsyncStorage, safe-area context, vector icons,
React Native Maps, React Native WebView, and geolocation. See `jest.setup.js`
and `jest.config.js`.

## Data and product guardrails

- All demonstration records live in `src/services/mock/data.ts` and are marked
  with `isDemoData` where the domain model supports it.
- The trip planner only uses configured routes and stops. It never invents a
  route, stop, fare, or travel time. If the graph cannot connect two points it
  returns an empty result.
- No live vehicle positions, ETAs, or real-time arrival data are implemented.
- Location permission denial and permanent blocking are handled explicitly in
  the Explore flow and Settings.
- Before release, replace the mock services with verified operator data and
  review every fare and route against the relevant LTFRB records.

## Known limitations

- The backend is not part of this repository; production Axios clients are
  present but unused while mocks are enabled.
- The bundled Nunito file is a variable font. iOS uses its PostScript name
  (`Nunito-Regular`) and Android uses the family name (`Nunito`); verify both on
  a physical device when changing the font.
- The OpenStreetMap view is a Leaflet map inside a WebView. It requires network
  access for Leaflet, tiles, and map interactions; offline maps are not
  implemented. The community OSM tile server is not intended for production
  traffic, so configure a suitable provider before release.
- Android release builds still use the debug signing configuration from the
  React Native template and must be replaced before distribution.
