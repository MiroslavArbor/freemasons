import { useEffect, useState } from 'react';
import { parseCsv } from '../lib/parseCsv';

// Promise cache: prevents duplicate fetches when multiple components need the same URL
// and avoids re-fetching on navigation.
const cache = new Map();

/**
 * @param {string} url
 * @returns {{ rows: string[][] | null; error: string | null; loading: boolean }}
 */
export function useCsv(url) {
  const [state, setState] = useState(() => {
    // If already resolved, start hydrated (no loading flash).
    return { rows: null, error: null, loading: true };
  });

  useEffect(() => {
    let cancelled = false;

    if (!cache.has(url)) {
      cache.set(
        url,
        fetch(url)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.text();
          })
          .then((text) => ({ rows: parseCsv(text), error: null }))
          .catch((e) => ({
            rows: null,
            error: e instanceof Error ? e.message : 'Could not load data.',
          })),
      );
    }

    cache.get(url).then((result) => {
      if (!cancelled) setState({ ...result, loading: false });
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
