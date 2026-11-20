import type {
  AuthTokens,
  TransportationCategory,
  UserRole,
  UserStatus,
  VerificationChallenge,
} from '../../types';

/** Standard success envelope returned by every byaheko-api endpoint. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta: PaginationMeta | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiErrorItem {
  field?: string;
  message: string;
}

/** Standard error envelope returned by byaheko-api. */
export interface ApiErrorBody {
  success?: false;
  message?: string | string[];
  errors?: ApiErrorItem[];
  error?: string;
  statusCode?: number;
}

/** A `User` row as serialized by Prisma (password excluded by the API). */
export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string | null;
  avatar: string | null;
  status: UserStatus;
  role: UserRole;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ApiAuthResult {
  user: ApiUser;
  tokens: AuthTokens;
}

export interface ApiRegistrationResult {
  user: ApiUser;
  verification: VerificationChallenge;
}

export interface ApiVerificationResult {
  user: ApiUser;
  verified: true;
}

export type ApiVerificationChallenge = VerificationChallenge;

/** Query parameters accepted by the paginated list endpoints. */
export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

export type ApiFavoriteType = 'ROUTE' | 'BOARDING_POINT' | 'DESTINATION';

export type ApiBoardingPointType =
  | 'JEEPNEY_STOP'
  | 'BUS_STOP'
  | 'TERMINAL'
  | 'TRICYCLE_TERMINAL'
  | 'FERRY_TERMINAL'
  | 'TRAIN_STATION'
  | 'OTHER';

export type ApiAdvisorySeverity =
  | 'INFO'
  | 'MINOR'
  | 'MODERATE'
  | 'SEVERE'
  | 'CRITICAL';

/** A `Favorite` row exactly as returned by `GET /favorites`. */
export interface ApiFavorite {
  id: string;
  userId: string;
  type: ApiFavoriteType;
  targetId: string;
  label: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFavoriteInput {
  type: ApiFavoriteType;
  targetId: string;
  label?: string;
}

export interface UpdateFavoriteInput {
  label?: string;
}

/** A `Notification` row exactly as returned by `GET /notifications`. */
export interface ApiNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationInput {
  isRead?: boolean;
}

/** Raw route values as returned by `GET /routes` (see byaheko-api entities). */
export type ApiEntityStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type ApiStopType = 'ORIGIN' | 'INTERMEDIATE' | 'DESTINATION';
export type ApiTransportationTypeCode = Uppercase<TransportationCategory>;

export interface ApiRouteStop {
  id: string;
  routeId: string;
  name: string;
  sequence: number;
  stopType: ApiStopType;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiRouteTransportationType {
  id: string;
  routeId: string;
  transportationTypeId: string;
  /** Seeded transportation type code, e.g. JEEPNEY. */
  code?: ApiTransportationTypeCode;
  isPrimary: boolean;
  isVerified: boolean;
  sourceName: string | null;
  sourceUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiRoute {
  id: string;
  routeCode: string;
  name: string;
  origin: string;
  destination: string;
  locality: string;
  district: string | null;
  status: ApiEntityStatus;
  isVerified: boolean;
  sourceName: string | null;
  sourceUrl: string | null;
  mapUrl: string | null;
  distanceKm: number | null;
  distanceIsRoundtrip: boolean;
  fare: number | null;
  fareDescription: string | null;
  estimatedDurationMin: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  stops?: ApiRouteStop[];
  transportationTypes?: ApiRouteTransportationType[];
}

/** A `BoardingPoint` row exactly as returned by `GET /boarding-points`. */
export interface ApiBoardingPoint {
  id: string;
  routeId: string;
  name: string;
  type: ApiBoardingPointType;
  address: string | null;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  sequence: number | null;
  isActive: boolean;
  isVerified: boolean;
  sourceName: string | null;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A `Fare` row exactly as returned by `GET /fares`. */
export interface ApiFare {
  id: string;
  routeId: string;
  boardingPointId: string | null;
  transportationTypeId: string | null;
  amount: number;
  currency: string;
  description: string | null;
  isRoundtrip: boolean;
  isVerified: boolean;
  sourceName: string | null;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** An `Announcement` row exactly as returned by `GET /announcements`. */
export interface ApiAnnouncement {
  id: string;
  title: string;
  body: string;
  authorId: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** An `Advisory` row exactly as returned by `GET /advisories`. */
export interface ApiAdvisory {
  id: string;
  routeId: string | null;
  severity: ApiAdvisorySeverity;
  title: string;
  message: string;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}
