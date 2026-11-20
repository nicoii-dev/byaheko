import { MESSAGES } from '../src/config/messages';
import { getErrorMessage, getStatusMessage } from '../src/utils/errors';
import { asList, requireData } from '../src/utils/apiData';

describe('getErrorMessage', () => {
  it('keeps helpful server messages', () => {
    expect(getErrorMessage('Invalid email or password.')).toBe(
      'Invalid email or password.',
    );
  });

  it('replaces raw transport text with friendly copy', () => {
    expect(getErrorMessage('Network Error')).toBe(MESSAGES.genericError);
    expect(getErrorMessage('Request failed with status code 500')).toBe(
      MESSAGES.genericError,
    );
    expect(getErrorMessage('timeout of 15000ms exceeded')).toBe(
      MESSAGES.genericError,
    );
  });

  it('uses the supplied fallback when no usable message exists', () => {
    expect(getErrorMessage(new Error(''), 'Please try again later.')).toBe(
      'Please try again later.',
    );
    expect(getErrorMessage(undefined)).toBe(MESSAGES.genericError);
  });

  it('maps HTTP status codes to friendly messages', () => {
    expect(getStatusMessage(401)).toBe(MESSAGES.unauthorized);
    expect(getStatusMessage(404)).toBe(MESSAGES.notFound);
    expect(getStatusMessage(429)).toBe(MESSAGES.rateLimited);
    expect(getStatusMessage(500)).toBe(MESSAGES.serverError);
    expect(getStatusMessage(503)).toBe(MESSAGES.serverError);
    expect(getStatusMessage(200)).toBeNull();
  });
});

describe('api data helpers', () => {
  it('coerces missing list payloads to an empty array', () => {
    expect(asList<number>(null)).toEqual([]);
    expect(asList<number>(undefined)).toEqual([]);
    expect(asList([1, 2])).toEqual([1, 2]);
  });

  it('throws friendly copy when required data is missing', () => {
    expect(() => requireData(null)).toThrow(MESSAGES.genericError);
    expect(() => requireData(undefined, MESSAGES.noData)).toThrow(
      MESSAGES.noData,
    );
    expect(requireData({ id: '1' })).toEqual({ id: '1' });
  });
});
