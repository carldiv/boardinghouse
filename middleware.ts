import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ---------------------------------------------------------------------------
// In-memory rate limiter
// Each entry tracks the sliding-window token bucket per unique key (IP + path).
// This is per-instance; on Vercel each cold-start gets a fresh store — still
// effective against burst abuse on a single instance.
// ---------------------------------------------------------------------------

interface Bucket {
  tokens: number;
  lastRefill: number; // ms timestamp
}

const store = new Map<string, Bucket>();

interface RateLimitRule {
  /** How many requests are allowed per window */
  limit: number;
  /** Window length in milliseconds */
  windowMs: number;
}

/**
 * Returns true when the request is ALLOWED, false when it should be blocked.
 * Uses a sliding-window token-bucket: tokens are refilled proportionally as
 * time passes, giving a smoother experience than a hard reset.
 */
function isAllowed(key: string, rule: RateLimitRule): boolean {
  const now = Date.now();
  let bucket = store.get(key);

  if (!bucket) {
    bucket = { tokens: rule.limit, lastRefill: now };
    store.set(key, bucket);
  }

  // Refill tokens proportional to elapsed time
  const elapsed = now - bucket.lastRefill;
  const refill = (elapsed / rule.windowMs) * rule.limit;
  bucket.tokens = Math.min(rule.limit, bucket.tokens + refill);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    return false; // rate-limited
  }

  bucket.tokens -= 1;
  return true;
}

// Periodically purge stale entries to prevent unbounded memory growth.
// Runs at most once per 5 minutes (lazy cleanup on requests).
let lastCleanup = Date.now();
function maybePurgeStore() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;
  for (const [key, bucket] of store.entries()) {
    // Remove entries that have been fully refilled (idle for > 1 window)
    if (bucket.tokens >= 60) store.delete(key);
  }
}

// ---------------------------------------------------------------------------
// Rate limit rules per route pattern
// ---------------------------------------------------------------------------

interface RouteRule {
  /** Regex to match the pathname */
  pattern: RegExp;
  limit: number;
  windowMs: number;
}

const RATE_LIMIT_RULES: RouteRule[] = [
  // Login form submissions — strict: 5 attempts per 60 seconds per IP
  { pattern: /^\/login$/, limit: 5, windowMs: 60_000 },

  // Ref duplicate check — called on every keystroke; allow 30/min
  { pattern: /^\/api\/check-ref$/, limit: 30, windowMs: 60_000 },

  // Cron endpoint — should only be hit by the scheduler; 10/min generous guard
  { pattern: /^\/api\/cron/, limit: 10, windowMs: 60_000 },

  // Ping keep-warm endpoint — very permissive: 60/min
  { pattern: /^\/api\/ping$/, limit: 60, windowMs: 60_000 },

  // All other API routes — general guard: 60/min
  { pattern: /^\/api\//, limit: 60, windowMs: 60_000 },
];

function getRuleForPath(pathname: string): RouteRule | null {
  for (const rule of RATE_LIMIT_RULES) {
    if (rule.pattern.test(pathname)) return rule;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Auth — routes that require a logged-in session
// ---------------------------------------------------------------------------

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];
const PUBLIC_PATHS = ["/login", "/api/ping", "/api/cron"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// ---------------------------------------------------------------------------
// Middleware entry point
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  maybePurgeStore();

  // ------------------------------------------------------------------
  // 1. Rate limiting (applied before session work to shed load early)
  // ------------------------------------------------------------------
  const rule = getRuleForPath(pathname);
  if (rule) {
    // Use the real client IP; fall back to a header set by Vercel/proxies
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const key = `${ip}:${pathname}`;
    if (!isAllowed(key, rule)) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please slow down." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(rule.windowMs / 1000)),
          },
        }
      );
    }
  }

  // ------------------------------------------------------------------
  // 2. Supabase session refresh
  //    Required by @supabase/ssr — must run on every request so the
  //    auth cookie is kept fresh.
  // ------------------------------------------------------------------
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Retrieve user (also refreshes the session cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ------------------------------------------------------------------
  // 3. Auth guard — redirect unauthenticated users to /login
  // ------------------------------------------------------------------
  if (isProtected(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from /login
  if (pathname === "/login" && user) {
    const role = user.user_metadata?.role;
    const dest = request.nextUrl.clone();
    dest.pathname = role === "admin" ? "/admin/dashboard" : "/dashboard";
    return NextResponse.redirect(dest);
  }

  return response;
}

// ---------------------------------------------------------------------------
// Matcher — run middleware on all routes except static assets and images
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Match every path EXCEPT:
     * - _next/static  (Next.js static assets)
     * - _next/image   (Next.js image optimisation)
     * - favicon.ico, site.webmanifest, robots.txt, sitemap.xml
     * - Files with a known static extension
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot|css|js|map)).*)",
  ],
};
