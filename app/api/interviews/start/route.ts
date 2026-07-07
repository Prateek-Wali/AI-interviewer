import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkInterviewLimit } from "@/lib/limits";
import { generateSlimPrompt, generateResumePrompt } from "@/lib/interview-prompts";
import { matchAnsweredRowsToBank } from "@/lib/question-matching";

// A dropped interview (page refresh, browser crash) can be resumed if it
// started within this window; older IN_PROGRESS rows are treated as abandoned
const RESUME_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
  try {
    // 1. Get the User from Supabase Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, difficulty, targetDuration } = body;

    // --- Ensure user exists in DB ---
    await db.user.upsert({
      where: { id: user.id },
      update: { email: user.email },
      create: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || "Candidate",
      },
    });

    // 2. Fetch user preferences
    const userPrefs = await db.userPreferences.findUnique({
      where: { userId: user.id }
    });

    // 3. Fetch pre-generated questions from QuestionBank
    const questions = await db.questionBank.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    console.log(`📋 Found ${questions.length} pre-generated questions for user`);

    if (questions.length === 0) {
      console.warn("⚠️ WARNING: QuestionBank is empty! The user may not have uploaded a resume, or resume processing failed. AI will fall back to generic questions.");
    }

    // 4. Resume a recent in-progress interview (e.g. after a page refresh)
    //    instead of creating a new row — this doesn't count against the limit
    const existing = await db.interview.findFirst({
      where: {
        userId: user.id,
        status: "IN_PROGRESS",
        startedAt: { gte: new Date(Date.now() - RESUME_WINDOW_MS) },
      },
      orderBy: { startedAt: "desc" },
      include: { questions: { orderBy: { askedAt: "asc" } } },
    });

    if (existing && questions.length > 0) {
      const answered = existing.questions.filter(q => q.userResponse !== null);
      // Progress = bank questions actually completed (matched by question
      // text), NOT answered-row count — rows also hold follow-up questions
      const answeredBankIndices = matchAnsweredRowsToBank(
        answered.map(q => q.questionText),
        questions.map(q => q.questionText)
      );

      if (answeredBankIndices.length < questions.length) {
        const pending = [...existing.questions].reverse().find(q => q.userResponse === null);

        // If nothing was answered yet, a fresh intro prompt is fine;
        // otherwise re-inject saved context and skip the intro
        const systemPrompt = answeredBankIndices.length > 0
          ? generateResumePrompt(
              questions,
              userPrefs,
              existing.type,
              answeredBankIndices,
              answered.map(q => ({
                questionText: q.questionText,
                userResponse: q.userResponse ?? "",
              }))
            )
          : generateSlimPrompt(questions, userPrefs, existing.type);

        console.log(`🔄 Resuming in-progress interview ${existing.id} — ${answeredBankIndices.length}/${questions.length} bank questions answered`);

        return NextResponse.json({
          success: true,
          interviewId: existing.id,
          systemPrompt,
          resuming: true,
          answeredCount: answeredBankIndices.length,
          answeredBankIndices,
          pendingQuestionId: pending?.id ?? null,
          questions: questions.map(q => ({
            id: q.id,
            text: q.questionText,
            category: q.category,
            context: q.context,
          })),
          userContext: {
            targetRole: userPrefs?.targetRole || "General",
            experienceLevel: userPrefs?.experienceLevel || "Entry",
          }
        });
      }
    }

    // --- Check interview limit (only when actually starting a new one) ---
    const limitCheck = await checkInterviewLimit(user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: `Monthly limit of ${limitCheck.limit} interviews reached.` },
        { status: 403 }
      );
    }

    // 5. Create interview session
    const interview = await db.interview.create({
      data: {
        userId: user.id,
        type: type || "BEHAVIORAL",
        difficulty: difficulty || "Medium",
        targetDuration: targetDuration || 1800,
        status: "IN_PROGRESS"
      }
    });

    // 6. Generate SLIM system prompt (no resume, just questions)
    const systemPrompt = generateSlimPrompt(questions, userPrefs, type);

    return NextResponse.json({
      success: true,
      interviewId: interview.id,
      systemPrompt,
      resuming: false,
      answeredCount: 0,
      answeredBankIndices: [],
      pendingQuestionId: null,
      questions: questions.map(q => ({
        id: q.id,
        text: q.questionText,
        category: q.category,
        context: q.context,
      })),
      userContext: {
        targetRole: userPrefs?.targetRole || "General",
        experienceLevel: userPrefs?.experienceLevel || "Entry",
      }
    });

  } catch (error: any) {
    console.error("❌ SERVER CRASH:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
