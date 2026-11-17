import { useEffect, useState } from 'react';

/**
 * Returns `value` after it has stayed unchanged for `delay` milliseconds.
 * Useful for keeping keystrokes from firing a network or mock-service request
 * on every character.
 */
export const useDebouncedValue = <T,>(value: T, delay = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
};

export default useDebouncedValue;
