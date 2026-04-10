/**
 * Cookies API Route
 * @route GET /api/products/cookies - Get all cookie-type products
 */

import { NextResponse } from "next/server";
import { productRepository } from "@/infrastructure/db/product.adapter";

/**
 * GET /api/products/cookies
 * Get all cookie-type products
 */
export async function GET() {
  try {
    const cookies = await productRepository.getAllCookies();
    return NextResponse.json({ success: true, data: cookies });
  } catch (error) {
    console.error("Failed to fetch cookies:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cookies" },
      { status: 500 }
    );
  }
}
