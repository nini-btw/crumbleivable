/**
 * Votes Reset API Route
 * @route POST /api/votes/reset - Reset all vote counts (admin only)
 */

import { NextResponse } from "next/server";
import { voteRepository } from "@/infrastructure/db/vote.adapter";
import { requireAdmin } from "@/infrastructure/auth/supabase-auth";

/**
 * POST /api/votes/reset
 * Reset all vote counts (admin only)
 */
export async function POST() {
  try {
    await requireAdmin();
    
    await voteRepository.resetAll();
    
    return NextResponse.json(
      { success: true, message: "All votes reset successfully" }
    );
  } catch (error: any) {
    console.error("Failed to reset votes:", error);
    
    if (error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reset votes" },
      { status: 500 }
    );
  }
}
