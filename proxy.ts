import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// In-memory rate limiter (sliding-window token bucket)
// Per-instance; resets on cold starts — effective against burst abuse.
// ---------------------------------------------------------------------------

interface Bucket {
  tokens: number;
  lastRefill: number; // ms timestamp
}

const store = new Map<string, Bucket>();

interface RateLimitRule {
  limit: number;    // max requests per window
  windowMs: number; // window length in ms
}

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

  if (bucket.tokens < 1) return false;

  bucket.tokens -= 1;
  return true;
}

// Lazy cleanup — purge idle entries every 5 minutes
let lastCleanup = Date.now();
function maybePurgeStore() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;
  for (const [key, bucket] of store.entries()) {
    if (bucket.tokens >= 60) store.delete(key);
  }
}

interface RouteRule extends RateLimitRule {
  pattern: RegExp;
}

const RATE_LIMIT_RULES: RouteRule[] = [
  // Login — strict: 5 attempts / 60 s per IP
  { pattern: /^\/login$/, limit: 5, windowMs: 60_000 },
  // Ref duplicate check — called on keystroke; 30 / min
  { pattern: /^\/api\/check-ref$/, limit: 30, windowMs: 60_000 },
  // Cron trigger — 10 / min
  { pattern: /^\/api\/cron/, limit: 10, windowMs: 60_000 },
  // Keep-warm ping — very permissive: 60 / min
  { pattern: /^\/api\/ping$/, limit: 60, windowMs: 60_000 },
  // All other API routes — 60 / min
  { pattern: /^\/api\//, limit: 60, windowMs: 60_000 },
];

function getRuleForPath(pathname: string): RouteRule | null {
  for (const rule of RATE_LIMIT_RULES) {
    if (rule.pattern.test(pathname)) return rule;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Proxy entry point
// ---------------------------------------------------------------------------

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  maybePurgeStore();

  // ── Rate limiting ────────────────────────────────────────────────────────
  const rule = getRuleForPath(pathname);
  if (rule) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (!isAllowed(`${ip}:${pathname}`, rule)) {
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

  // ── Supabase session refresh ─────────────────────────────────────────────
  // Important: do not add logic between createServerClient and getUser()
  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Public routes — always allowed ────────────────────────────────────────
  if (pathname.startsWith("/api")) {
    return supabaseResponse;
  }

  if (pathname.startsWith("/login")) {
    // Already logged in → send to appropriate dashboard
    if (user) {
      const role = user.user_metadata?.role;
      const dest = role === "admin" ? "/admin/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return supabaseResponse;
  }

  // ── Unauthenticated → login ───────────────────────────────────────────────
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = user.user_metadata?.role as string | undefined;

  // ── Tenant trying to access admin routes → redirect ───────────────────────
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── Admin trying to access tenant dashboard → redirect ────────────────────
  if (pathname === "/dashboard" && role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
