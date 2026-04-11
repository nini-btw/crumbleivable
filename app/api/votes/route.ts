/**
 * Votes API Routes
 * @route GET /api/votes - Get all active vote candidates
 * @route POST /api/votes - Vote for a candidate
 */

import { NextRequest, NextResponse } from "next/server";
import { voteRepository } from "@/infrastructure/db/vote.adapter";
import { getAdminSession } from "@/infrastructure/auth/supabase-auth";
import crypto from "crypto";

/**
 * Generate a fingerprint for the voter based on IP and User-Agent
 */
function generateVoterFingerprint(request: NextRequest): string {
  const ip = request.headers.get("x-forwarded-for") || 
             request.headers.get("x-real-ip") || 
             "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  
  const data = `${ip}:${userAgent}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

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

    // Generate voter fingerprint
    const voterFingerprint = generateVoterFingerprint(request);
    
    // Check if already voted
    const hasVoted = await voteRepository.hasVoted(body.candidateId, voterFingerprint);
    if (hasVoted) {
      return NextResponse.json(
        { success: false, error: "You have already voted for this candidate" },
        { status: 409 }
      );
    }

    await voteRepository.vote(body.candidateId, voterFingerprint);
    
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
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
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
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create candidate" },
      { status: 500 }
    );
  }
}
