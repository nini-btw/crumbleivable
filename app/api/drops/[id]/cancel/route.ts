/**
 * Cancel Drop API Route
 * @route POST /api/drops/[id]/cancel - Cancel a scheduled drop (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/infrastructure/auth/supabase-auth";
import { db } from "@/infrastructure/db/client";
import { weeklyDrops } from "@/infrastructure/db/schema";
import { eq } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/drops/[id]/cancel
 * Cancel a scheduled drop (admin only)
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

    // Delete the drop
    await db.delete(weeklyDrops).where(eq(weeklyDrops.id, id));

    return NextResponse.json(
      { success: true, message: "Drop cancelled successfully" }
    );
  } catch (error: any) {
    console.error("Failed to cancel drop:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to cancel drop" },
      { status: 500 }
    );
  }
}
