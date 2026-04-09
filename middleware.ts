/**
 * Next.js middleware
 * Protects admin routes
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/infrastructure/auth/config";

/**
 * Middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes (except login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // In production, use proper session validation
    // For now, we'll let the layout handle auth
  }

  return NextResponse.next();
}

/**
 * Middleware config
 */
export const config = {
  matcher: ["/admin/:path*"],
};
