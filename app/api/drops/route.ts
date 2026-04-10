/**
 * Drops API Routes
 * @route GET /api/drops - Get current drop
 * @route POST /api/drops - Create new drop (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { dropRepository } from "@/infrastructure/db/drop.adapter";
import { requireAdmin } from "@/infrastructure/auth/supabase-auth";

/**
 * GET /api/drops
 * Get current active drop or all drops if admin
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";
    
    if (all) {
      // Get all drops for admin
      const drops = await dropRepository.getAll();
      return NextResponse.json({ success: true, data: drops });
    }
    
    // Get current active drop
    const drop = await dropRepository.getCurrent();
    return NextResponse.json({ success: true, data: drop });
  } catch (error) {
    console.error("Failed to fetch drop:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch drop" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/drops
 * Create new drop schedule (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    
    if (!body.productId || !body.scheduledAt) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: productId, scheduledAt" },
        { status: 400 }
      );
    }

    const drop = await dropRepository.create({
      productId: body.productId,
      scheduledAt: new Date(body.scheduledAt),
      isActive: body.isActive ?? true,
    });
    
    return NextResponse.json(
      { success: true, data: drop, message: "Drop scheduled successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create drop:", error);
    
    if (error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create drop" },
      { status: 500 }
    );
  }
}
