// app/api/interviews/[id]/questions/[questionId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateQuestionResponse } from "@/lib/db/interview-helpers";
import { evaluateAnswer, classifyResponse } from "@/lib/gemini";
import { db } from "@/lib/prisma";

/**
 * PATCH /api/interviews/[id]/questions/[questionId]
 * Called when user finishes answering a question.
 * Saves the response, responds immediately, then evaluates in background.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    // 1. Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Get IDs from params
    const { questionId } = await params;

    // 3. Parse request body
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

    // 4. Validate required fields
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

    // 5. Classify: answer, meta-request, or small talk?
    const classification = await classifyResponse(userResponse);

    if (classification === "META_REQUEST") {
      console.log(`🔁 Meta-request detected for question ${questionId}, skipping save:`, userResponse);
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "meta_request",
        message: "Response classified as a meta-request (repeat/clarification), not saved."
      });
    }

    if (classification === "SMALL_TALK") {
      console.log(`🗑️ Small talk detected, deleting question record ${questionId}:`, userResponse);
      await db.question.delete({ where: { id: questionId } });
      return NextResponse.json({
        success: true,
        skipped: true,
        smallTalk: true,
        reason: "small_talk",
        message: "Response classified as small talk, question record deleted."
      });
    }

    // 6. Save answer to DB immediately
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

    // 6. Fire-and-forget: evaluate answer in background
    //    This does NOT block the response — the interview continues.
    evaluateAnswer(
      updatedQuestion.questionText,
      userResponse,
      updatedQuestion.questionType,
      responseDuration
    )
      .then(async (evaluation) => {
        // Update the question row with real scores
        await db.question.update({
          where: { id: questionId },
          data: {
            confidenceScore: evaluation.confidenceScore,
            fillerWordCount: evaluation.fillerWordCount,
            speakingRate: evaluation.communicationScore, // Repurposing speakingRate field for communication score
          },
        });
        console.log(`✅ Background evaluation saved for question ${questionId}`);
      })
      .catch((err) => {
        console.error(`❌ Background evaluation failed for ${questionId}:`, err);
      });

    // 7. Respond immediately — user keeps interviewing
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