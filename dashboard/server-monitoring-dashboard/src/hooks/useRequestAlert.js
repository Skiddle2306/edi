import { useRef, useCallback } from 'react';

export const useRequestAlert = (threshold = 10) => {
  const prevCountRef = useRef(null);

  const checkAlert = useCallback((currentCount) => {
    if (prevCountRef.current === null) {
      prevCountRef.current = currentCount;
      return null;
    }

    const delta = currentCount - prevCountRef.current;
    prevCountRef.current = currentCount;

    if (delta >= threshold) {
      return {
        message: `🚨 Request spike detected! +${delta} requests since last check.`,
        delta,
      };
    }
    return null;
  }, [threshold]);

  return { checkAlert };
};