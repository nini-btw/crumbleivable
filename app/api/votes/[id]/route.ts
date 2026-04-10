/**
 * Individual Vote Candidate API Routes
 * @route DELETE /api/votes/[id] - Delete vote candidate (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { voteRepository } from "@/infrastructure/db/vote.adapter";
import { requireAdmin } from "@/infrastructure/auth/supabase-auth";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/votes/[id]
 * Delete vote candidate (admin only)
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    await voteRepository.delete(id);
    
    return NextResponse.json(
      { success: true, message: "Vote candidate deleted successfully" }
    );
  } catch (error: any) {
    console.error("Failed to delete vote candidate:", error);
    
    if (error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete candidate" },
      { status: 500 }
    );
  }
}
