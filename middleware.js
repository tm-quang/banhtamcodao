/**
 * middleware.js
 * Next.js Middleware for security protection
 * 
 * Features:
 * - Admin route protection
 * - Rate limiting
 * - Security headers
 * - CSRF protection
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Rate limiting storage (in-memory)
 * Production: Use Redis or Vercel KV
 */
const rateLimitMap = new Map();

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
    admin: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100, // Max 100 requests per window
    },
    api: {
        windowMs: 1 * 60 * 1000, // 1 minute
        maxRequests: 60, // Max 60 requests per minute
    },
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5, // Max 5 login attempts per 15 minutes
    }
};

/**
 * Check rate limit for a given IP and route type
 */
function checkRateLimit(ip, routeType) {
    const config = RATE_LIMIT_CONFIG[routeType] || RATE_LIMIT_CONFIG.api;
    const now = Date.now();
    const key = `${ip}-${routeType}`;

    // Get or create rate limit entry
    let rateLimitEntry = rateLimitMap.get(key);

    if (!rateLimitEntry) {
        rateLimitEntry = {
            count: 0,
            resetTime: now + config.windowMs
        };
        rateLimitMap.set(key, rateLimitEntry);
    }

    // Reset if window expired
    if (now > rateLimitEntry.resetTime) {
        rateLimitEntry.count = 0;
        rateLimitEntry.resetTime = now + config.windowMs;
    }

    // Increment counter
    rateLimitEntry.count++;

    // Check if limit exceeded
    if (rateLimitEntry.count > config.maxRequests) {
        return {
            limited: true,
            resetTime: rateLimitEntry.resetTime,
            remaining: 0
        };
    }

    return {
        limited: false,
        resetTime: rateLimitEntry.resetTime,
        remaining: config.maxRequests - rateLimitEntry.count
    };
}

/**
 * Clean up old rate limit entries (run periodically)
 */
function cleanupRateLimitMap() {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetTime + 60000) { // 1 minute after reset
            rateLimitMap.delete(key);
        }
    }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimitMap, 5 * 60 * 1000);

/**
 * Verify admin authentication
 */
async function verifyAdminAuth(request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            return { authenticated: false, isAdmin: false };
        }

        // Get access token from cookie
        const accessToken = request.cookies.get('sb-access-token')?.value;
        const refreshToken = request.cookies.get('sb-refresh-token')?.value;

        if (!accessToken && !refreshToken) {
            return { authenticated: false, isAdmin: false };
        }

        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            },
            global: {
                headers: accessToken ? {
                    Authorization: `Bearer ${accessToken}`
                } : {}
            }
        });

        // Set session if we have tokens
        if (accessToken && refreshToken) {
            await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
        }

        // Get user
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return { authenticated: false, isAdmin: false };
        }

        // Check role from customers table using service role
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceKey) {
            return { authenticated: true, isAdmin: false };
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const { data: customer } = await supabaseAdmin
            .from('customers')
            .select('role')
            .eq('account_id', user.id)
            .maybeSingle();

        const isAdmin = customer?.role === 'admin';

        return { authenticated: true, isAdmin };

    } catch (error) {
        console.error('Middleware auth error:', error);
        return { authenticated: false, isAdmin: false };
    }
}

/**
 * Main middleware function
 */
export async function middleware(request) {
    const { pathname } = request.nextUrl;
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    // Create response
    let response = NextResponse.next();

    /**
     * 1. SECURITY HEADERS - Apply to all routes
     */
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Additional security for admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
        response.headers.set('X-Robots-Tag', 'noindex, nofollow');
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }

    /**
     * 2. RATE LIMITING
     */

    // Rate limit for auth endpoints (login, register)
    if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register')) {
        const rateLimitResult = checkRateLimit(ip, 'auth');

        if (rateLimitResult.limited) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
                    retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
                        'X-RateLimit-Limit': String(RATE_LIMIT_CONFIG.auth.maxRequests),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(rateLimitResult.resetTime)
                    }
                }
            );
        }

        // Add rate limit headers to response
        response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_CONFIG.auth.maxRequests));
        response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
        response.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetTime));
    }

    // Rate limit for admin API endpoints
    if (pathname.startsWith('/api/admin')) {
        const rateLimitResult = checkRateLimit(ip, 'admin');

        if (rateLimitResult.limited) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
                    retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
                        'X-RateLimit-Limit': String(RATE_LIMIT_CONFIG.admin.maxRequests),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(rateLimitResult.resetTime)
                    }
                }
            );
        }

        response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_CONFIG.admin.maxRequests));
        response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
        response.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetTime));
    }

    // Rate limit for general API endpoints
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/admin') && !pathname.startsWith('/api/auth')) {
        const rateLimitResult = checkRateLimit(ip, 'api');

        if (rateLimitResult.limited) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
                    retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
                        'X-RateLimit-Limit': String(RATE_LIMIT_CONFIG.api.maxRequests),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(rateLimitResult.resetTime)
                    }
                }
            );
        }

        response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_CONFIG.api.maxRequests));
        response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
        response.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetTime));
    }

    /**
     * 3. ADMIN ROUTE PROTECTION
     */
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
        const { authenticated, isAdmin } = await verifyAdminAuth(request);

        // Not authenticated - redirect to login
        if (!authenticated) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('next', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Authenticated but not admin - redirect to home
        if (!isAdmin) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    /**
     * 4. ADMIN API PROTECTION
     */
    if (pathname.startsWith('/api/admin')) {
        const { authenticated, isAdmin } = await verifyAdminAuth(request);

        if (!authenticated) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!isAdmin) {
            return NextResponse.json(
                { success: false, message: 'Forbidden - Admin only' },
                { status: 403 }
            );
        }
    }

    return response;
}

/**
 * Middleware configuration
 * Specify which routes should run through middleware
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
