/**
 * Votes Reset API Route
 * @route POST /api/votes/reset - Reset all vote counts (admin only)
 */

import { NextResponse } from "next/server";
import { voteRepository } from "@/infrastructure/db/vote.adapter";
import { getAdminSession } from "@/infrastructure/auth/supabase-auth";

/**
 * POST /api/votes/reset
 * Reset all vote counts (admin only)
 */
export async function POST() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    await voteRepository.resetAll();
    
    return NextResponse.json(
      { success: true, message: "All votes reset successfully" }
    );
  } catch (error: any) {
    console.error("Failed to reset votes:", error);
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reset votes" },
      { status: 500 }
    );
  }
}
