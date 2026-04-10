/**
 * Next.js middleware
 * Protects admin routes using Supabase Auth
 */

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // Debug log (remove in production)
  console.log(`[Middleware] ${pathname}`);

  // Create Supabase client
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // No-op in middleware
      },
    },
  });

  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser();
  
  console.log(`[Middleware] User: ${user?.email || 'null'}, Error: ${error?.message || 'none'}`);

  // Normalize path - handle both /admin/login and /admin/login/
  const normalizedPath = pathname.replace(/\/$/, '');
  const isLoginPage = normalizedPath === '/admin/login';
  const isAdminRoute = normalizedPath.startsWith('/admin');

  // LOGIN PAGE: Allow unauthenticated, redirect authenticated users to dashboard
  if (isLoginPage) {
    if (user) {
      console.log('[Middleware] Already logged in, redirecting to /admin');
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    console.log('[Middleware] On login page, not authenticated - allowing access');
    return NextResponse.next();
  }

  // OTHER ADMIN ROUTES: Require authentication
  if (isAdminRoute && !user) {
    console.log('[Middleware] Not authenticated, redirecting to /admin/login');
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Allow request
  console.log('[Middleware] Allowing request');
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
