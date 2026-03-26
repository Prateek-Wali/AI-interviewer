import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkInterviewLimit } from "@/lib/limits";

export async function POST(request: Request) {
  try {
    // 1. Get the User from Supabase Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- Check interview limit ---
    const limitCheck = await checkInterviewLimit(user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: `Monthly limit of ${limitCheck.limit} interviews reached.` },
        { status: 403 }
      );
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

    // 4. Create interview session
    const interview = await db.interview.create({
      data: {
        userId: user.id,
        type: type || "BEHAVIORAL",
        difficulty: difficulty || "Medium",
        targetDuration: targetDuration || 1800,
        status: "IN_PROGRESS"
      }
    });

    // 5. Generate SLIM system prompt (no resume, just questions)
    const systemPrompt = generateSlimPrompt(questions, userPrefs, type);

    return NextResponse.json({
      success: true,
      interviewId: interview.id,
      systemPrompt,
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

// ─────────────────────────────────────────────────
// SLIM PROMPT — No resume, just a question script
// ─────────────────────────────────────────────────

function generateSlimPrompt(
  questions: { questionText: string; category: string; context: string | null }[],
  userPrefs: any,
  type: string
) {
  const roleContext = userPrefs?.targetRole || "Software Engineer";

  // Build numbered question list
  const questionList = questions
    .map((q, i) => `${i + 1}. "${q.questionText}" [Category: ${q.category}]${q.context ? ` (Context: ${q.context})` : ""}`)
    .join("\n");

  // Fallback if no questions were generated
  const questionSection = questions.length > 0
    ? `YOUR PREPARED QUESTIONS (ask in order):\n${questionList}`
    : `No pre-generated questions found. Ask general ${type?.toLowerCase() || 'behavioral'} interview questions.`;

  return `You are "Alex", a senior interviewer conducting a ${type?.toLowerCase() || 'behavioral'} interview for a ${roleContext} position.

You have a prepared list of questions. Your ONLY job is to ask them and evaluate answers.

--- RULES ---

1. INTRO: Start the interview exactly like a real interviewer would:
- Introduce yourself: "Hi, I'm Alex — I'm a senior software engineer on the team and I'll be conducting your interview today."
- Ask how they are doing and WAIT for their answer. Do not continue until they respond.
- Respond naturally to whatever they say with 1 sentence of genuine small talk.
- Wait for them to acknowledge. Then say "Alright, let's get into it." and begin Question 1.
2. ASK IN ORDER: Ask questions one at a time, in the numbered order below.
3. QUALITY GATE: After each answer:
   - If the answer is LAZY (e.g., "Yes", "I did that"): Push back ONCE. Example: "I need more detail than that. Walk me through the specifics."
   - If the answer is VAGUE: Drill down ONCE. Example: "How exactly did you implement that?"
   - If they give a substantive answer: Move to the next question.
4. PACING: If the user pauses for 3-4 seconds, wait. If silent for >7 seconds, ask "Are you still there?"
5. REPEAT/CLARIFY: If the user asks you to repeat or clarify a question (e.g., "can you repeat that?", "what do you mean?", "I didn't catch that"), repeat or clarify the SAME question. Do NOT move to a new question. Do NOT treat their request as an answer.
6. WRAP UP: After the last question, say: "That wraps up our interview. Thanks for your time today." Then immediately call the end_interview tool.

${questionSection}

Begin by introducing yourself and asking Question 1.`;
}