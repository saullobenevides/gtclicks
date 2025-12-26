/**
 * Cache utility using Vercel KV (Redis)
 * Provides simple get/set/invalidate operations with TTL support
 */

// Mock implementation for development (will be replaced with @vercel/kv in production)
const isDev = process.env.NODE_ENV !== 'production';

// In-memory cache for development
const devCache = new Map();

/**
 * Get cached value or fetch and cache
 * @param {string} key - Cache key
 * @param {Function} fetcher - Function to fetch data if cache miss
 * @param {number} ttl - Time to live in seconds (default: 3600 = 1 hour)
 * @returns {Promise<any>} Cached or fetched data
 */
export async function getCached(key, fetcher, ttl = 3600) {
  if (isDev) {
    // Development: use in-memory cache
    const cached = devCache.get(key);
    if (cached && cached.expires > Date.now()) {
      console.log(`✅ Cache HIT: ${key}`);
      return cached.data;
    }
    
    console.log(`❌ Cache MISS: ${key}`);
    const data = await fetcher();
    devCache.set(key, {
      data,
      expires: Date.now() + (ttl * 1000)
    });
    return data;
  }
  
  // Production: use Vercel KV (to be implemented)
  // For now, just fetch without caching
  console.log(`⚠️  Cache disabled in production (Vercel KV not configured)`);
  return await fetcher();
}

/**
 * Invalidate cache by key or pattern
 * @param {string} pattern - Key or pattern to invalidate (supports wildcards in production)
 */
export async function invalidate(pattern) {
  if (isDev) {
    // Development: clear matching keys
    const keys = Array.from(devCache.keys());
    const regex = new RegExp(pattern.replace('*', '.*'));
    
    keys.forEach(key => {
      if (regex.test(key)) {
        devCache.delete(key);
        console.log(`🗑️  Cache invalidated: ${key}`);
      }
    });
  }
  
  // Production: use Vercel KV scan and delete
  console.log(`🗑️  Cache invalidation: ${pattern}`);
}

/**
 * Set cache value directly
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 */
export async function setCache(key, value, ttl = 3600) {
  if (isDev) {
    devCache.set(key, {
      data: value,
      expires: Date.now() + (ttl * 1000)
    });
    console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
  }
}

/**
 * Clear all cache (use with caution)
 */
export async function clearAll() {
  if (isDev) {
    devCache.clear();
    console.log(`🗑️  All cache cleared`);
  }
}
