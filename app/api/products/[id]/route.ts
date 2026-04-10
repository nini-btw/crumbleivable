/**
 * Individual Product API Routes
 * @route GET /api/products/[id] - Get product by ID
 * @route PUT /api/products/[id] - Update product (admin only)
 * @route DELETE /api/products/[id] - Delete product (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { productRepository } from "@/infrastructure/db/product.adapter";
import { requireAdmin } from "@/infrastructure/auth/supabase-auth";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/products/[id]
 * Get product by ID
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const product = await productRepository.getById(id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id]
 * Update product (admin only)
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const body = await request.json();
    
    const product = await productRepository.update(id, body);
    
    return NextResponse.json(
      { success: true, data: product, message: "Product updated successfully" }
    );
  } catch (error: any) {
    console.error("Failed to update product:", error);
    
    if (error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Delete product (admin only)
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    await productRepository.delete(id);
    
    return NextResponse.json(
      { success: true, message: "Product deleted successfully" }
    );
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    
    if (error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
