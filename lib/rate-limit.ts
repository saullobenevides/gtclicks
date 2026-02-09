/**
 * Rate limiting using Upstash Redis.
 * Falls back to no-op when Redis is not configured (e.g. dev without KV).
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasRedis =
  !!(process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL) &&
  !!(process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN);

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

/**
 * Download rate limit: 20 requests per minute per identifier (IP or token).
 */
export const downloadRateLimit = hasRedis
  ? new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      prefix: "rl:download",
    })
  : null;

/**
 * Returns true if the request is allowed, false if rate limited.
 */
export async function checkDownloadRateLimit(
  identifier: string
): Promise<{ allowed: boolean }> {
  if (!downloadRateLimit) return { allowed: true };
  const { success } = await downloadRateLimit.limit(identifier);
  return { allowed: success };
}
