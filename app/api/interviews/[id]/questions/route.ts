import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createQuestion } from "@/lib/db/interview-helpers";

export async function POST(
  request: NextRequest,
  // 1. CHANGE THIS LINE: params is a Promise now
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { questionText, questionType } = body;

    // 2. CHANGE THIS LINE: await the params to get the ID
    const { id: interviewId } = await params;

    // Verify ownership
    const { db } = await import("@/lib/prisma");
    const interview = await db.interview.findUnique({
      where: { id: interviewId },
      select: { userId: true },
    });

    if (!interview || interview.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!questionText || typeof questionText !== "string") {
      return NextResponse.json(
        { error: "questionText is required and must be a string" },
        { status: 400 }
      );
    }

    // 3. Save to DB
    const question = await createQuestion({
      interviewId, // Now this is a valid string, not undefined
      questionText,
      questionType: questionType || "Technical",
    });

    return NextResponse.json({
      success: true,
      questionId: question.id,
      message: "Question saved successfully",
    }, { status: 201 });

  } catch (error) {
    console.error("Error saving question:", error);
    return NextResponse.json(
      { error: "Failed to save question" },
      { status: 500 }
    );
  }
}