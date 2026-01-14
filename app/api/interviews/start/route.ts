import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

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

    // --- 🛡️ SAFETY FIX: ENSURE USER EXISTS ---
    await db.user.upsert({
      where: { id: user.id },
      update: { email: user.email },
      create: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || "Candidate",
      },
    });

    // 2. Fetch user preferences (safely handle if they don't exist)
    const userPrefs = await db.userPreferences.findUnique({
      where: { userId: user.id }
    });

    // 3. Create interview session
    const interview = await db.interview.create({
      data: {
        userId: user.id,
        type: type || "TECHNICAL",
        difficulty: difficulty || "Medium",
        targetDuration: targetDuration || 1800,
        status: "IN_PROGRESS"
      }
    });

    // 4. Generate system prompt
    const systemPrompt = generateSystemPrompt(userPrefs, type, difficulty);

    return NextResponse.json({
      success: true,
      interviewId: interview.id,
      systemPrompt,
      userContext: {
        targetRole: userPrefs?.targetRole || "General",
        experienceLevel: userPrefs?.experienceLevel || "Entry",
        resumeSummary: userPrefs?.resumeText?.substring(0, 100) + "..."
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

// --- UPDATED PROMPT GENERATOR ---
function generateSystemPrompt(userPrefs: any, type: string, difficulty: string) {
  const roleContext = userPrefs?.targetRole || "Software Engineer";
  const experienceLevel = userPrefs?.experienceLevel || "Entry Level";

  // Resume Context
  const resumeContext = userPrefs?.resumeText
    ? `CANDIDATE RESUME:\n"${userPrefs.resumeText.substring(0, 5000)}"`
    : "No resume provided.";

  return `You are "Alex", a senior software engineer conducting a strict ${type?.toLowerCase() || 'behavioral'} interview for a ${roleContext} position.
  
  USER CONTEXT:
  - Target Role: ${roleContext}
  - Experience Level: ${experienceLevel}
  ${resumeContext}
  
--- CRITICAL INSTRUCTIONS ---

  PHASE 1: THE QUALITY GATE (ALWAYS APPLY THIS)
  Before moving to a new topic, you MUST evaluate the candidate's last answer.
  - **IF THE ANSWER IS LAZY (e.g., "Yes", "I did that", "It was good"):**
    - STOP. Do not move on.
    - Call them out professionally. Example: "Could you elaborate? 'Yes' doesn't give me much insight into your process." or "I need more detail than that. Walk me through the specifics."
  - **IF THE ANSWER IS VAGUE:**
    - Drill down immediately. "How exactly did you implement that?" or "What specific metrics improved?"
  - **ONLY** move to the next question if they have provided a substantive, multi-sentence answer.

  PHASE 2: THE INTERVIEW FLOW
  1. **Intro:** Briefly introduce yourself as Alex. Ask: "Tell me about yourself."
  
  2. **The Pivot:** After their intro, acknowledge it briefly but **DO NOT** follow up on personal details. Immediately pivot to their resume.
     - *Example:* "Thanks. I want to dive into your resume. You mentioned Project X..."

  3. **Resume Deep Dive (The Core):**
     - Grill them on specific technologies listed in the resume text above.
     - Ask *why* they chose technology X over Y.
     - Challenge their claims. If they list "Expert in SQL", ask a hard optimization question.

  4. **Behavioral Friction:**
     - Ask: "Describe a time a teammate disagreed with you. How did you handle it?"
     - If they give a generic "we talked it out" answer, push back: "That sounds too easy. Give me a specific example where there was real conflict."

  PHASE 3: SILENCE & PACING
  - If the user pauses for 1-2 seconds, **WAIT**. Do not interrupt. They are thinking.
  - If they are silent for >5 seconds, ask: "Take your time, let me know when you're ready."
  
  Begin the interview now by introducing yourself.`;
}