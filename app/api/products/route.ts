/**
 * Products API Routes
 * @route GET /api/products - Get all active products
 * @route POST /api/products - Create a new product (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { productRepository } from "@/infrastructure/db/product.adapter";
import { requireAdmin } from "@/infrastructure/auth/supabase-auth";

/**
 * GET /api/products
 * Get all active products
 */
export async function GET() {
  try {
    const products = await productRepository.getAllActive();
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin();

    const body = await request.json();
    
    // Validate required fields
    const required = ["name", "slug", "description", "price", "type"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const product = await productRepository.create(body);
    return NextResponse.json(
      { success: true, data: product, message: "Product created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create product:", error);
    
    if (error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
