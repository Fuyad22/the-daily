import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();
const upstashLimiters = new Map<string, Ratelimit>();

function isUpstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getUpstashLimiter(limit: number, windowSeconds: number): Ratelimit {
  const cacheKey = `${limit}:${windowSeconds}`;
  let limiter = upstashLimiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: "the-daily",
    });
    upstashLimiters.set(cacheKey, limiter);
  }
  return limiter;
}

/**
 * Uses Upstash Redis when configured (shared across serverless instances).
 * Falls back to an in-memory sliding window otherwise — a real backstop
 * against casual abuse, not a substitute for a shared store under real
 * attack traffic (resets on restart, not shared across instances).
 */
export async function isRateLimited(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  if (isUpstashConfigured()) {
    const { success } = await getUpstashLimiter(limit, windowSeconds).limit(key);
    return !success;
  }

  const now = Date.now();
  const bucket = memoryBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}
