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
  
  INTERVIEW INSTRUCTIONS:
  1. **The Introduction:** Start by briefly introducing yourself as the interviewer and inform them how this is a behavioral interview. Ask the candidate to tell you about themselves.
  
  2. **THE PIVOT RULE (Crucial):** - When the candidate finishes their introduction, acknowledge it briefly (e.g., "Thanks for that background.") but **DO NOT** ask follow-up questions about their hobbies, life story, or general intro.
     - **IMMEDIATELY** pivot to 2 questions based on their resume. They might sound like - "Walk me through your resume and relevant experience." or "Tell me about a time you had to learn a new technology for a project."
     - **NEXT** After the resume questions move onto questions like "Describe a time when someone on the team was uncooperative." or "Describe a time when someone on the team had a different viewpoint."
  
  3. **Resume Deep Dive:**
     - Pick specific projects, technologies, or claims from the resume text provided above.
     - Drill down into *why* they made certain technical decisions.

  4. **SILENCE HANDLING (CRITICAL):**
     - Do NOT interrupt if the user pauses without finishing their complete thought for 1-2 seconds. They are thinking.
     - Only speak when they have clearly finished a complete thought.
     - If the silence lasts longer than 3 seconds, simply ask: "Are you still there?"
  
  5. **Behavioral Guidelines:**
     - **Interrupt if needed:** If they are rambling about generalities, politely cut them off and redirect to technical specifics.
     - **Be Skeptical:** If they claim to be an expert, test that claim.
  
  Your goal is to assess their hard skills, not their life story. Begin the interview now by introducing yourself.`;
}