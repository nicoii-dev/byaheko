/**
 * DEMONSTRATION DATA ONLY.
 *
 * The records below are illustrative sample data used while the ByaheKo
 * backend is being built. They are not verified public utility vehicle routes,
 * terminals, or LTFRB fares. Replace this module with API responses before
 * shipping the app to commuters.
 */
import type {
  Announcement,
  AppNotification,
  BoardingPoint,
  Location,
  PopularRoute,
  Route,
  Transportation,
} from '../../types';
import { TRANSPORTATION_META } from '../../config/constants';

export const DEMO_DATA_NOTICE =
  'Demonstration data only. Routes, stops, and fares are samples and must be verified before release.';

const categoryDescription: Record<string, string> = {
  jeepney: 'Traditional Philippine jeepney',
  modern_jeepney: 'Air-conditioned modern jeepney',
  multicab: 'Multi-passenger cab',
  tricycle: 'Motorcycle with sidecar',
  bus: 'Large public bus',
  uv_express: 'Air-conditioned UV Express van',
  van: 'Public utility van',
  ferry: 'Water transport',
  train: 'Rail transport',
};

export const demoTransportationCategories: Transportation[] = (
  Object.keys(TRANSPORTATION_META) as (keyof typeof TRANSPORTATION_META)[]
).map(category => ({
  id: `cat_${category}`,
  name: TRANSPORTATION_META[category].label,
  category,
  icon: TRANSPORTATION_META[category].icon,
  description: categoryDescription[category],
}));

export const demoPlaces: Location[] = [
  {
    id: 'place_sm_cdo',
    name: 'SM City Cagayan de Oro',
    address: 'Uptown, Cagayan de Oro',
    latitude: 8.4859,
    longitude: 124.6478,
  },
  {
    id: 'place_centrio',
    name: 'Centrio Mall',
    address: 'Uptown, Cagayan de Oro',
    latitude: 8.4836,
    longitude: 124.6535,
  },
  {
    id: 'place_limketkai',
    name: 'Limketkai Center',
    address: 'Uptown, Cagayan de Oro',
    latitude: 8.4818,
    longitude: 124.6539,
  },
  {
    id: 'place_divisoria',
    name: 'Divisoria Plaza',
    address: 'Downtown, Cagayan de Oro',
    latitude: 8.4775,
    longitude: 124.645,
  },
  {
    id: 'place_city_hall',
    name: 'Cagayan de Oro City Hall',
    address: 'City Hall, Cagayan de Oro',
    latitude: 8.4844,
    longitude: 124.6466,
  },
  {
    id: 'place_cogon',
    name: 'Cogon Market',
    address: 'Cogon, Cagayan de Oro',
    latitude: 8.4758,
    longitude: 124.6414,
  },
  {
    id: 'place_gusa',
    name: 'Gusa Terminal',
    address: 'Gusa, Cagayan de Oro',
    latitude: 8.4937,
    longitude: 124.67,
  },
  {
    id: 'place_carmen',
    name: 'Carmen Public Market',
    address: 'Carmen, Cagayan de Oro',
    latitude: 8.4925,
    longitude: 124.629,
  },
  {
    id: 'place_bulua',
    name: 'Bulua Terminal',
    address: 'Bulua, Cagayan de Oro',
    latitude: 8.4708,
    longitude: 124.59,
  },
  {
    id: 'place_xavier',
    name: 'Xavier University',
    address: 'Corrales Avenue, Cagayan de Oro',
    latitude: 8.4774,
    longitude: 124.6468,
  },
  {
    id: 'place_lico',
    name: 'Liceo de Cagayan University',
    address: 'R.N. Pelaez Boulevard, Cagayan de Oro',
    latitude: 8.4861,
    longitude: 124.6412,
  },
];

export const demoBoardingPoints: BoardingPoint[] = [
  {
    id: 'bp_sm_terminal',
    name: 'SM City CDO Jeepney Terminal',
    address: 'SM City Cagayan de Oro, Uptown',
    latitude: 8.4859,
    longitude: 124.6478,
    transportationTypes: ['jeepney', 'modern_jeepney', 'multicab'],
    routeIds: ['route_sm_centrio', 'route_sm_limketkai'],
    description: 'Sample boarding area for demonstration routes.',
  },
  {
    id: 'bp_centrio_stop',
    name: 'Centrio Mall Jeepney Stop',
    address: 'Centrio Mall, Uptown',
    latitude: 8.4836,
    longitude: 124.6535,
    transportationTypes: ['jeepney', 'modern_jeepney', 'uv_express'],
    routeIds: ['route_sm_centrio', 'route_centrio_divisoria'],
    description: 'Sample curbside stop for demonstration routes.',
  },
  {
    id: 'bp_limketkai_terminal',
    name: 'Limketkai UV Express Terminal',
    address: 'Limketkai Center, Uptown',
    latitude: 8.4818,
    longitude: 124.6539,
    transportationTypes: ['uv_express', 'van', 'modern_jeepney'],
    routeIds: ['route_limketkai_bulua', 'route_sm_limketkai'],
    description: 'Sample terminal for demonstration routes.',
  },
  {
    id: 'bp_city_hall',
    name: 'City Hall Bus Stop',
    address: 'Cagayan de Oro City Hall',
    latitude: 8.4844,
    longitude: 124.6466,
    transportationTypes: ['bus', 'jeepney'],
    routeIds: ['route_cityhall_gusa', 'route_sm_centrio'],
    description: 'Sample roadside stop for demonstration routes.',
  },
  {
    id: 'bp_divisoria',
    name: 'Divisoria Jeepney Stand',
    address: 'Divisoria Plaza, Downtown',
    latitude: 8.4775,
    longitude: 124.645,
    transportationTypes: ['jeepney', 'tricycle', 'multicab'],
    routeIds: ['route_centrio_divisoria', 'route_divisoria_cogon'],
    description: 'Sample downtown stand for demonstration routes.',
  },
  {
    id: 'bp_cogon',
    name: 'Cogon Market Tricycle Stand',
    address: 'Cogon Market, Cagayan de Oro',
    latitude: 8.4758,
    longitude: 124.6414,
    transportationTypes: ['tricycle', 'jeepney'],
    routeIds: ['route_divisoria_cogon'],
    description: 'Sample tricycle stand for demonstration routes.',
  },
  {
    id: 'bp_gusa',
    name: 'Gusa Terminal',
    address: 'Gusa, Cagayan de Oro',
    latitude: 8.4937,
    longitude: 124.67,
    transportationTypes: ['bus', 'multicab', 'jeepney'],
    routeIds: ['route_cityhall_gusa'],
    description: 'Sample terminal for demonstration routes.',
  },
  {
    id: 'bp_carmen',
    name: 'Carmen Jeepney Terminal',
    address: 'Carmen Public Market',
    latitude: 8.4925,
    longitude: 124.629,
    transportationTypes: ['jeepney', 'multicab'],
    routeIds: ['route_carmen_sm'],
    description: 'Sample terminal for demonstration routes.',
  },
  {
    id: 'bp_bulua',
    name: 'Bulua Integrated Terminal',
    address: 'Bulua, Cagayan de Oro',
    latitude: 8.4708,
    longitude: 124.59,
    transportationTypes: ['bus', 'van', 'uv_express'],
    routeIds: ['route_limketkai_bulua'],
    description: 'Sample inter-city terminal for demonstration routes.',
  },
];

const stop = (
  id: string,
  name: string,
  latitude: number,
  longitude: number,
  sequence: number,
  stopType: Route['stops'][number]['stopType'],
): Route['stops'][number] => ({
  id,
  name,
  latitude,
  longitude,
  sequence,
  stopType,
});

export const demoRoutes: Route[] = [
  {
    id: 'route_sm_centrio',
    routeCode: 'DEMO-01',
    routeName: 'SM City – Centrio via City Hall',
    origin: 'SM City Cagayan de Oro',
    destination: 'Centrio Mall',
    transportationType: 'jeepney',
    fare: 13,
    estimatedDuration: 22,
    status: 'active',
    isDemoData: true,
    stops: [
      stop('stop_01_sm', 'SM City CDO Terminal', 8.4859, 124.6478, 1, 'boarding'),
      stop('stop_01_hall', 'City Hall', 8.4844, 124.6466, 2, 'transfer'),
      stop('stop_01_centrio', 'Centrio Mall', 8.4836, 124.6535, 3, 'dropoff'),
    ],
  },
  {
    id: 'route_centrio_divisoria',
    routeCode: 'DEMO-02',
    routeName: 'Centrio – Divisoria',
    origin: 'Centrio Mall',
    destination: 'Divisoria Plaza',
    transportationType: 'modern_jeepney',
    fare: 15,
    estimatedDuration: 18,
    status: 'active',
    isDemoData: true,
    stops: [
      stop('stop_02_centrio', 'Centrio Mall', 8.4836, 124.6535, 1, 'boarding'),
      stop('stop_02_xavier', 'Xavier University', 8.4774, 124.6468, 2, 'transfer'),
      stop('stop_02_divisoria', 'Divisoria Plaza', 8.4775, 124.645, 3, 'dropoff'),
    ],
  },
  {
    id: 'route_sm_limketkai',
    routeCode: 'DEMO-03',
    routeName: 'SM City – Limketkai',
    origin: 'SM City Cagayan de Oro',
    destination: 'Limketkai Center',
    transportationType: 'modern_jeepney',
    fare: 15,
    estimatedDuration: 16,
    status: 'active',
    isDemoData: true,
    stops: [
      stop('stop_03_sm', 'SM City CDO Terminal', 8.4859, 124.6478, 1, 'boarding'),
      stop('stop_03_lico', 'Liceo de Cagayan', 8.4861, 124.6412, 2, 'transfer'),
      stop('stop_03_limketkai', 'Limketkai Center', 8.4818, 124.6539, 3, 'dropoff'),
    ],
  },
  {
    id: 'route_limketkai_bulua',
    routeCode: 'DEMO-04',
    routeName: 'Limketkai – Bulua Terminal',
    origin: 'Limketkai Center',
    destination: 'Bulua Terminal',
    transportationType: 'uv_express',
    fare: 35,
    estimatedDuration: 32,
    status: 'active',
    isDemoData: true,
    stops: [
      stop('stop_04_limketkai', 'Limketkai UV Express Terminal', 8.4818, 124.6539, 1, 'boarding'),
      stop('stop_04_divisoria', 'Divisoria', 8.4775, 124.645, 2, 'transfer'),
      stop('stop_04_bulua', 'Bulua Terminal', 8.4708, 124.59, 3, 'dropoff'),
    ],
  },
  {
    id: 'route_cityhall_gusa',
    routeCode: 'DEMO-05',
    routeName: 'City Hall – Gusa',
    origin: 'Cagayan de Oro City Hall',
    destination: 'Gusa Terminal',
    transportationType: 'bus',
    fare: 20,
    estimatedDuration: 28,
    status: 'active',
    isDemoData: true,
    stops: [
      stop('stop_05_hall', 'City Hall Bus Stop', 8.4844, 124.6466, 1, 'boarding'),
      stop('stop_05_centrio', 'Centrio Mall', 8.4836, 124.6535, 2, 'transfer'),
      stop('stop_05_gusa', 'Gusa Terminal', 8.4937, 124.67, 3, 'dropoff'),
    ],
  },
  {
    id: 'route_divisoria_cogon',
    routeCode: 'DEMO-06',
    routeName: 'Divisoria – Cogon Market',
    origin: 'Divisoria Plaza',
    destination: 'Cogon Market',
    transportationType: 'tricycle',
    fare: 10,
    estimatedDuration: 12,
    status: 'active',
    isDemoData: true,
    stops: [
      stop('stop_06_divisoria', 'Divisoria Jeepney Stand', 8.4775, 124.645, 1, 'boarding'),
      stop('stop_06_cogon', 'Cogon Market', 8.4758, 124.6414, 2, 'dropoff'),
    ],
  },
  {
    id: 'route_carmen_sm',
    routeCode: 'DEMO-07',
    routeName: 'Carmen – SM City',
    origin: 'Carmen Public Market',
    destination: 'SM City Cagayan de Oro',
    transportationType: 'multicab',
    fare: 18,
    estimatedDuration: 26,
    status: 'active',
    isDemoData: true,
    stops: [
      stop('stop_07_carmen', 'Carmen Jeepney Terminal', 8.4925, 124.629, 1, 'boarding'),
      stop('stop_07_lico', 'Liceo de Cagayan', 8.4861, 124.6412, 2, 'transfer'),
      stop('stop_07_sm', 'SM City CDO Terminal', 8.4859, 124.6478, 3, 'dropoff'),
    ],
  },
];

export const demoPopularRoutes: PopularRoute[] = [
  {
    id: 'popular_01',
    routeId: 'route_sm_centrio',
    label: 'SM City → Centrio',
    origin: 'SM City Cagayan de Oro',
    destination: 'Centrio Mall',
    transportationType: 'jeepney',
    estimatedFare: 13,
    estimatedDuration: 22,
    isDemoData: true,
  },
  {
    id: 'popular_02',
    routeId: 'route_centrio_divisoria',
    label: 'Centrio → Divisoria',
    origin: 'Centrio Mall',
    destination: 'Divisoria Plaza',
    transportationType: 'modern_jeepney',
    estimatedFare: 15,
    estimatedDuration: 18,
    isDemoData: true,
  },
  {
    id: 'popular_03',
    routeId: 'route_limketkai_bulua',
    label: 'Limketkai → Bulua',
    origin: 'Limketkai Center',
    destination: 'Bulua Terminal',
    transportationType: 'uv_express',
    estimatedFare: 35,
    estimatedDuration: 32,
    isDemoData: true,
  },
  {
    id: 'popular_04',
    routeId: 'route_cityhall_gusa',
    label: 'City Hall → Gusa',
    origin: 'Cagayan de Oro City Hall',
    destination: 'Gusa Terminal',
    transportationType: 'bus',
    estimatedFare: 20,
    estimatedDuration: 28,
    isDemoData: true,
  },
];

export const demoAnnouncements: Announcement[] = [
  {
    id: 'announcement_01',
    title: 'Sample route advisory',
    message:
      'This is a demonstration advisory. Verified service updates will appear here once the ByaheKo data API is connected.',
    type: 'advisory',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isDemoData: true,
  },
  {
    id: 'announcement_02',
    title: 'Welcome to ByaheKo',
    message:
      'Explore nearby boarding points and plan a sample trip. All route and fare information shown in this build is demonstration data.',
    type: 'announcement',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isDemoData: true,
  },
];

export const demoNotifications: AppNotification[] = [
  {
    id: 'notif_01',
    title: 'Demonstration route advisory',
    message:
      'DEMO-01 is showing a sample detour notice. Real advisories will come from the ByaheKo API.',
    type: 'advisory',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'notif_02',
    title: 'Service update',
    message:
      'Modern jeepney sample data is now available on the Centrio – Divisoria demonstration route.',
    type: 'update',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'notif_03',
    title: 'Welcome to ByaheKo',
    message:
      'Your saved routes and places will be available here. This notification is sample content.',
    type: 'announcement',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];
