/**
 * Votes API Routes
 * @route GET /api/votes - Get all active vote candidates
 * @route POST /api/votes - Vote for a candidate
 */

import { NextRequest, NextResponse } from "next/server";
import { voteRepository } from "@/infrastructure/db/vote.adapter";
import { requireAdmin } from "@/infrastructure/auth/supabase-auth";

/**
 * GET /api/votes
 * Get all active vote candidates
 */
export async function GET() {
  try {
    const candidates = await voteRepository.getAllActive();
    return NextResponse.json({ success: true, data: candidates });
  } catch (error) {
    console.error("Failed to fetch vote candidates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vote candidates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/votes
 * Cast a vote for a candidate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.candidateId) {
      return NextResponse.json(
        { success: false, error: "Missing candidateId" },
        { status: 400 }
      );
    }

    await voteRepository.vote(body.candidateId);
    
    return NextResponse.json(
      { success: true, message: "Vote cast successfully" }
    );
  } catch (error: any) {
    console.error("Failed to cast vote:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to cast vote" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/votes
 * Admin: Create new vote candidate
 */
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    
    const required = ["cookieName", "description", "imageUrl"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const candidate = await voteRepository.create({
      cookieName: body.cookieName,
      description: body.description,
      imageUrl: body.imageUrl,
      isActive: body.isActive ?? true,
    });
    
    return NextResponse.json(
      { success: true, data: candidate, message: "Vote candidate created" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create vote candidate:", error);
    
    if (error.message === "NEXT_REDIRECT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create candidate" },
      { status: 500 }
    );
  }
}
