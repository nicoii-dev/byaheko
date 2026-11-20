import { MESSAGES } from '../config/messages';

/**
 * Coerces a possibly missing list payload into an array.
 *
 * The API wraps responses in `{ success, message, data }`; when `data` is
 * `null` we would otherwise store `null` in Redux and crash on `.length`/
 * `.map`. Returning an empty list lets the UI show a friendly empty state.
 */
export function asList<T>(data: T[] | null | undefined): T[] {
  return Array.isArray(data) ? data : [];
}

/**
 * Ensures required data is present, replacing a missing payload with a
 * user-friendly error instead of a `undefined is not an object` crash.
 */
export function requireData<T>(
  data: T | null | undefined,
  message: string = MESSAGES.genericError,
): T {
  if (data === null || data === undefined) {
    throw new Error(message);
  }
  return data;
}
