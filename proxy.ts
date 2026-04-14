/**
 * Next.js proxy
 * Handles admin route protection
 * Note: i18n is handled client-side via next-intl
 */

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { locales, defaultLocale } from './i18n.config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// List of valid locales
const validLocales = locales as readonly string[];

// Get locale from request headers or cookie
function getLocaleFromRequest(request: NextRequest): string {
  // Check cookie first
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (localeCookie && validLocales.includes(localeCookie)) {
    return localeCookie;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')[0]
      .split('-')[0]
      .toLowerCase();
    if (validLocales.includes(preferredLocale)) {
      return preferredLocale;
    }
  }

  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create response
  const response = NextResponse.next();

  // Detect and set locale
  const locale = getLocaleFromRequest(request);
  response.cookies.set('NEXT_LOCALE', locale, { path: '/' });
  response.headers.set('x-locale', locale);

  // Skip auth check for non-admin routes
  if (!pathname.startsWith('/admin')) {
    return response;
  }

  // Create Supabase client
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();

  const normalizedPath = pathname.replace(/\/$/, '');
  const isLoginPage = normalizedPath === '/admin/login';

  // LOGIN PAGE: Allow unauthenticated, redirect authenticated users to dashboard
  if (isLoginPage) {
    if (user) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return response;
  }

  // OTHER ADMIN ROUTES: Require authentication
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next|api|trpc|\\..*).*)'],
};
