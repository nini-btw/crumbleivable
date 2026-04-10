/**
 * Orders API Routes
 * @route GET /api/orders - Get all orders (admin only)
 * @route POST /api/orders - Create a new order
 */

import { NextRequest, NextResponse } from "next/server";
import { orderRepository } from "@/infrastructure/db/order.adapter";
import { getAdminSession } from "@/infrastructure/auth/supabase-auth";
import { canCheckout } from "@/domain/rules/cart.rules";
import type { CreateOrderPayload } from "@/domain/entities/order";

/**
 * GET /api/orders
 * Get all orders (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check if admin
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    
    const orders = await orderRepository.getAll(limit);
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderPayload = await request.json();
    
    // Validate cart minimum
    if (!canCheckout(body.items)) {
      return NextResponse.json(
        { success: false, error: "Minimum 3 cookies required for checkout" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.customer?.fullName || !body.customer?.phone || !body.customer?.address) {
      return NextResponse.json(
        { success: false, error: "Missing customer information" },
        { status: 400 }
      );
    }

    const order = await orderRepository.create(body);
    
    return NextResponse.json(
      { success: true, data: order, message: "Order created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
