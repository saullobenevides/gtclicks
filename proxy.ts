import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Rate limit check for sensitive API routes.
 * Returns 429 response if exceeded, or null to continue.
 */
async function checkRateLimit(
  request: NextRequest,
  path: string
): Promise<NextResponse | null> {
  const hasRedis =
    !!(
      process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
    ) &&
    !!(
      process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
    );

  if (!hasRedis) return null;

  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");

    const redis = new Redis({
      url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL!,
      token:
        process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: `rl:${path.replace(/\//g, ":")}`,
    });

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em alguns minutos." },
        { status: 429 }
      );
    }
  } catch {
    // Fail open
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Rate limit for sensitive API routes
  if (path.startsWith("/api/download/")) {
    const res = await checkRateLimit(request, "download");
    if (res) return res;
  }
  if (path.startsWith("/api/upload")) {
    const res = await checkRateLimit(request, "upload");
    if (res) return res;
  }
  if (path.startsWith("/api/checkout") || path.startsWith("/api/mercadopago")) {
    const res = await checkRateLimit(request, "checkout");
    if (res) return res;
  }
  if (path.startsWith("/api/auth/")) {
    const res = await checkRateLimit(request, "auth");
    if (res) return res;
  }
  if (path === "/api/log") {
    const res = await checkRateLimit(request, "log");
    if (res) return res;
  }
  if (path === "/api/analytics/track") {
    const res = await checkRateLimit(request, "analytics");
    if (res) return res;
  }
  if (path === "/api/fotos/metrics") {
    const res = await checkRateLimit(request, "fotos-metrics");
    if (res) return res;
  }

  // API routes: pass through without CSP (only rate limit applied above)
  if (path.startsWith("/api/")) {
    return NextResponse.next();
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://lh3.googleusercontent.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://gtclicks.s3.sa-east-1.amazonaws.com https://lh3.googleusercontent.com https://images.unsplash.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(
    "Content-Security-Policy",
    // Report-only for now to avoid breaking things immediately
    cspHeader.replace(/\s{2,}/g, " ").trim(),
  );

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Security Headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  // HSTS (Production Only)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Rate limit: sensitive API routes
     */
    "/api/download/:path*",
    "/api/upload",
    "/api/upload/:path*",
    "/api/checkout/:path*",
    "/api/mercadopago/:path*",
    "/api/auth/:path*",
    "/api/log",
    "/api/analytics/track",
    "/api/fotos/metrics",
    /*
     * Pages: CSP + security headers (exclude api, _next, favicon)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
