/**
 * User-facing copy for API outcomes.
 *
 * Screens and error helpers should show these strings instead of raw
 * transport/HTTP text, so a failed request or an empty payload always reads as
 * plain language rather than "Network Error" or "Request failed (500)".
 */
export const MESSAGES = {
  genericError: "We couldn't complete that request. Please try again.",
  loadFailed: "We couldn't load this right now. Please try again.",
  noData: "There's nothing to show here yet. Please check back soon.",
  offline:
    'It looks like you are offline. Check your internet connection and try again.',
  timeout: 'This is taking longer than expected. Please try again.',
  serverError:
    'Something went wrong on our side. Please try again in a moment.',
  notFound: "We couldn't find what you were looking for.",
  unauthorized: 'Please sign in again to continue.',
  forbidden: "You don't have access to this just yet.",
  rateLimited: 'Too many attempts. Please wait a moment and try again.',
  badRequest:
    "That didn't go through. Please check your details and try again.",
  sessionExpired: 'Your session has expired. Please sign in again.',
} as const;
