import axios from 'axios';
import { MESSAGES } from '../config/messages';

/**
 * Messages that come from the transport layer (axios/JS engines) rather than
 * a human. These should never be shown to the user directly.
 */
const TECHNICAL_MESSAGE_PATTERNS: RegExp[] = [
  /^network error$/i,
  /^failed to fetch$/i,
  /^load failed$/i,
  /^socket hang up$/i,
  /^timeout of \d+ms exceeded$/i,
  /^request failed with status code \d+$/i,
  /^request failed \(\d+\)\.?$/i,
  /^status code \d+$/i,
  /^econn[a-z]+$/i,
  /^json parse/i,
  /^unexpected token/i,
  /^cannot read propert/i,
  /^undefined is not/i,
  /^null is not/i,
];

const isTechnicalMessage = (message: string): boolean => {
  const trimmed = message.trim();
  if (!trimmed) {
    return true;
  }
  return TECHNICAL_MESSAGE_PATTERNS.some(pattern => pattern.test(trimmed));
};

/** Maps an HTTP status code to friendly copy. */
export const getStatusMessage = (status?: number): string | null => {
  if (!status) {
    return null;
  }
  if (status === 401) {
    return MESSAGES.unauthorized;
  }
  if (status === 403) {
    return MESSAGES.forbidden;
  }
  if (status === 404) {
    return MESSAGES.notFound;
  }
  if (status === 429) {
    return MESSAGES.rateLimited;
  }
  if (status >= 500) {
    return MESSAGES.serverError;
  }
  if (status >= 400) {
    return MESSAGES.badRequest;
  }
  return null;
};

const cleanMessage = (message: unknown): string | null => {
  if (typeof message === 'string') {
    return isTechnicalMessage(message) ? null : message.trim();
  }
  if (Array.isArray(message)) {
    const parts = message
      .filter((item): item is string => typeof item === 'string')
      .map(item => item.trim())
      .filter(item => item.length > 0 && !isTechnicalMessage(item));
    return parts.length > 0 ? parts.join('\n') : null;
  }
  return null;
};

export const getErrorMessage = (
  error: unknown,
  fallback: string = MESSAGES.genericError,
): string => {
  if (typeof error === 'string') {
    return cleanMessage(error) ?? fallback;
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[]; error?: string }
      | undefined;

    const serverMessage =
      cleanMessage(data?.message) ?? cleanMessage(data?.error);

    if (serverMessage) {
      return serverMessage;
    }

    return (
      getStatusMessage(error.response?.status) ??
      cleanMessage(error.message) ??
      fallback
    );
  }

  if (error instanceof Error) {
    return cleanMessage(error.message) ?? fallback;
  }

  const nested = cleanMessage(
    typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message?: unknown }).message
      : undefined,
  );

  return nested ?? fallback;
};
