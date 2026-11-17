import type {
  AuthTokens,
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
