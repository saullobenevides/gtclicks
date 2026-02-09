/**
 * Cache utility using Upstash Redis (via Vercel Marketplace)
 * Provides simple get/set/invalidate operations with TTL support
 * @see https://vercel.com/docs/storage/vercel-kv
 */

import { Redis } from "@upstash/redis";

const isDev = process.env.NODE_ENV !== "production";
const hasRedis =
  !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

// Lazy-init Redis client (only when needed in production)
let redisClient: Redis | null = null;
function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return redisClient;
}

// In-memory cache for development (when Redis not configured)
interface DevCacheEntry {
  data: unknown;
  expires: number;
}
const devCache = new Map<string, DevCacheEntry>();

/**
 * Get cached value or fetch and cache
 * @param key - Cache key
 * @param fetcher - Function to fetch data if cache miss
 * @param ttl - Time to live in seconds (default: 3600 = 1 hour)
 * @returns Cached or fetched data
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600
): Promise<T> {
  if (isDev && !hasRedis) {
    const cached = devCache.get(key);
    if (cached && cached.expires > Date.now()) {
      console.log(`✅ Cache HIT: ${key}`);
      return cached.data as T;
    }
    console.log(`❌ Cache MISS: ${key}`);
    const data = await fetcher();
    devCache.set(key, {
      data,
      expires: Date.now() + ttl * 1000,
    });
    return data;
  }

  if (hasRedis) {
    try {
      const cached = await getRedis().get(key);
      if (cached != null) {
        console.log(`✅ Cache HIT: ${key}`);
        return (typeof cached === "string" ? JSON.parse(cached) : cached) as T;
      }
    } catch (err) {
      console.warn(
        `Cache read error (${key}):`,
        err instanceof Error ? err.message : String(err)
      );
    }

    console.log(`❌ Cache MISS: ${key}`);
    const data = await fetcher();
    try {
      await getRedis().set(key, JSON.stringify(data), { ex: ttl });
    } catch (err) {
      console.warn(
        `Cache write error (${key}):`,
        err instanceof Error ? err.message : String(err)
      );
    }
    return data;
  }

  return await fetcher();
}

/**
 * Invalidate cache by key or pattern
 * @param pattern - Key or pattern (e.g. "cache:home:*")
 */
export async function invalidate(pattern: string): Promise<void> {
  if (isDev && !hasRedis) {
    const keys = Array.from(devCache.keys());
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    keys.forEach((k) => {
      if (regex.test(k)) {
        devCache.delete(k);
        console.log(`🗑️  Cache invalidated: ${k}`);
      }
    });
    return;
  }

  if (hasRedis) {
    try {
      const keys = await getRedis().keys(pattern);
      if (keys.length > 0) {
        await getRedis().del(...keys);
        console.log(`🗑️  Cache invalidated: ${keys.length} keys (${pattern})`);
      }
    } catch (err) {
      console.warn(
        `Cache invalidate error (${pattern}):`,
        err instanceof Error ? err.message : String(err)
      );
    }
  }
}

/**
 * Set cache value directly
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttl - Time to live in seconds
 */
export async function setCache(
  key: string,
  value: unknown,
  ttl = 3600
): Promise<void> {
  if (isDev && !hasRedis) {
    devCache.set(key, {
      data: value,
      expires: Date.now() + ttl * 1000,
    });
    console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
    return;
  }

  if (hasRedis) {
    try {
      await getRedis().set(key, JSON.stringify(value), { ex: ttl });
      console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
    } catch (err) {
      console.warn(
        `Cache set error (${key}):`,
        err instanceof Error ? err.message : String(err)
      );
    }
  }
}

/**
 * Clear all cache (use with caution - Redis: flushes entire DB)
 */
export async function clearAll(): Promise<void> {
  if (isDev && !hasRedis) {
    devCache.clear();
    console.log(`🗑️  All cache cleared`);
    return;
  }

  if (hasRedis) {
    try {
      await getRedis().flushdb();
      console.log(`🗑️  All cache cleared (Redis)`);
    } catch (err) {
      console.warn(
        "Cache clear error:",
        err instanceof Error ? err.message : String(err)
      );
    }
  }
}
