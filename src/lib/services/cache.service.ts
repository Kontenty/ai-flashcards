interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

type CacheStore = Record<string, CacheEntry<unknown>>;

export class CacheService {
  private store: CacheStore = {};

  /**
   * Get a value from cache if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.store[key] as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.store[key];
      return null;
    }

    return entry.data;
  }

  /**
   * Set a value in cache with TTL
   */
  set<T>(key: string, value: T, ttlMs: number): void {
    this.store[key] = {
      data: value,
      expiresAt: Date.now() + ttlMs,
    };
  }

  /**
   * Clear expired entries from cache
   */
  cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].expiresAt < now) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.store[key];
      }
    });
  }
}

export const cacheService = new CacheService();
