// app/api/interviews/[id]/resume/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/prisma";
import { generateResumePrompt } from "@/lib/interview-prompts";
import { matchAnsweredRowsToBank } from "@/lib/question-matching";

/**
 * GET /api/interviews/[id]/resume
 * Rebuilds interview state from the DB after a dropped Gemini Live session.
 * Returns a resume system prompt plus the cursor info the client needs to
 * reconnect and continue at the next unanswered question.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: interviewId } = await params;

    const interview = await db.interview.findUnique({
      where: { id: interviewId },
      include: { questions: { orderBy: { askedAt: "asc" } } },
    });

    if (!interview || interview.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (interview.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Interview is no longer in progress" },
        { status: 409 }
      );
    }

    const [userPrefs, bank] = await Promise.all([
      db.userPreferences.findUnique({ where: { userId: user.id } }),
      db.questionBank.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const answered = interview.questions.filter(q => q.userResponse !== null);
    // Progress = bank questions actually completed, NOT answered-row count.
    // Rows also hold quality-gate follow-ups, so counting rows overstates
    // progress and makes the AI (and the client's auto-end) finish early.
    const answeredBankIndices = matchAnsweredRowsToBank(
      answered.map(q => q.questionText),
      bank.map(b => b.questionText)
    );
    // Most recent unanswered question row — reused by the client so the
    // re-asked question doesn't create a duplicate record
    const pending = [...interview.questions].reverse().find(q => q.userResponse === null);

    const resumePrompt = generateResumePrompt(
      bank,
      userPrefs,
      interview.type,
      answeredBankIndices,
      // Real question text is stored via output audio transcription;
      // follow-up rows are included too — they're useful context for the AI
      answered.map(q => ({
        questionText: q.questionText,
        userResponse: q.userResponse ?? "",
      }))
    );

    return NextResponse.json({
      success: true,
      resumePrompt,
      answeredCount: answeredBankIndices.length,
      answeredBankIndices,
      totalQuestions: bank.length,
      pendingQuestionId: pending?.id ?? null,
    });

  } catch (error) {
    console.error("Error building resume snapshot:", error);
    return NextResponse.json(
      { error: "Failed to build resume snapshot" },
      { status: 500 }
    );
  }
}
