/**
 * Reveal Drop API Route
 * @route POST /api/drops/[id]/reveal - Manually reveal a drop (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/infrastructure/auth/supabase-auth";
import { dropRepository } from "@/infrastructure/db/drop.adapter";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/drops/[id]/reveal
 * Manually reveal a drop and activate the product (admin only)
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    // Check if admin
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Reveal the drop (this also activates the product and marks as new)
    await dropRepository.markRevealed(id);

    return NextResponse.json(
      { success: true, message: "Drop revealed successfully - product is now active and marked as new" }
    );
  } catch (error: any) {
    console.error("Failed to reveal drop:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reveal drop" },
      { status: 500 }
    );
  }
}
