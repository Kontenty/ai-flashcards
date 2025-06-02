type RateLimitStore = Record<
  string,
  {
    count: number;
    resetTime: number;
  }
>;

const store: RateLimitStore = {};

export class RateLimitError extends Error {
  constructor(public readonly resetTime: number) {
    super("Rate limit exceeded");
    this.name = "RateLimitError";
  }
}

export function rateLimit(
  key: string,
  limit = 10,
  windowMs: number = 60 * 1000, // 1 minute
): void {
  const now = Date.now();
  const windowKey = `${key}:${Math.floor(now / windowMs)}`;

  if (!store[windowKey]) {
    store[windowKey] = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  store[windowKey].count++;

  if (store[windowKey].count > limit) {
    throw new RateLimitError(store[windowKey].resetTime);
  }

  // Cleanup old entries
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete store[key];
    }
  });
}
