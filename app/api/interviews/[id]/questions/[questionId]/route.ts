// app/api/interviews/[id]/questions/[questionId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { updateQuestionResponse } from "@/lib/db/interview-helpers";

/**
 * PATCH /api/interviews/[id]/questions/[questionId]
 * * Called when user finishes answering a question.
 * Updates the question record with the response and audio metrics.
 */
export async function PATCH(
  request: NextRequest,
  // 1. FIX: Type 'params' as a Promise
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    // 2. Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 3. FIX: Await params to get the IDs safely
    const { questionId } = await params;

    // 4. Parse request body
    const body = await request.json();
    const {
      userResponse,
      responseDuration,
      responseStartTime,
      responseEndTime,
      fillerWordCount,
      pauseCount,
      avgPauseDuration,
      speakingRate,
      confidenceScore,
    } = body;

    // 5. Validate required fields
    if (!userResponse || typeof userResponse !== "string") {
      return NextResponse.json(
        { error: "userResponse is required and must be a string" },
        { status: 400 }
      );
    }

    if (typeof responseDuration !== "number" || responseDuration < 0) {
      return NextResponse.json(
        { error: "responseDuration is required and must be a positive number" },
        { status: 400 }
      );
    }

    // 6. Update question with response and metrics
    const updatedQuestion = await updateQuestionResponse(questionId, {
      userResponse,
      responseDuration,
      responseStartTime,
      responseEndTime,
      fillerWordCount,
      pauseCount,
      avgPauseDuration,
      speakingRate,
      confidenceScore,
    });

    // 7. Return success
    return NextResponse.json({
      success: true,
      question: updatedQuestion,
      message: "Response saved successfully",
    });

  } catch (error) {
    console.error("Error updating question response:", error);
    return NextResponse.json(
      { 
        error: "Failed to save response",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/interviews/[id]/questions/[questionId]
 * * Get a specific question (useful for debugging)
 */
export async function GET(
  request: NextRequest,
  // 1. FIX: Type 'params' as a Promise here as well
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. FIX: Await params
    const { questionId } = await params;

    const { prisma } = await import("@/lib/db/interview-helpers");
    
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ question });

  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}