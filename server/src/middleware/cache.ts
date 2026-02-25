interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const store = new Map<string, CacheEntry>();

export const TTL = {
  CONFIRMED_TX: 60 * 60 * 1000,
  BLOCK: 60 * 60 * 1000,
  UNCONFIRMED_TX: 30 * 1000,
  ADDRESS: 60 * 1000,
  OUTSPEND: 5 * 60 * 1000,
};

export function cache(key: string, ttl: number) {
  return {
    get(): unknown | null {
      const entry = store.get(key);
      if (!entry) return null;
      if (Date.now() - entry.timestamp > ttl) {
        store.delete(key);
        return null;
      }
      return entry.data;
    },
    set(data: unknown): void {
      store.set(key, { data, timestamp: Date.now() });
    },
  };
}
