// app/api/interviews/start/route.ts
import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma"; // Make sure this import is correct now!

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
      update: { 
          email: user.email,
          updatedAt: new Date() // <--- Add this to be safe
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || "Candidate",
        updatedAt: new Date() // <--- Add this to satisfy the NOT NULL rule
      },
    });
    // ----------------------------------------

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
        resumeSummary: userPrefs?.resumeText?.substring(0, 500)
      }
    });

  } catch (error: any) {
    // LOG THE REAL ERROR TO YOUR TERMINAL
    console.error("❌ SERVER CRASH:", error); 
    
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message }, 
      { status: 500 }
    );
  }
}

// ... keep your generateSystemPrompt function below ...
function generateSystemPrompt(userPrefs: any, type: string, difficulty: string) {
    const roleContext = userPrefs?.targetRole || "Software Engineer";
    const experienceLevel = userPrefs?.experienceLevel || "Entry Level";
    const resumeSummary = userPrefs?.resumeText?.substring(0, 500) || "Not provided";
  
    return `You are an experienced ${type?.toLowerCase() || 'technical'} interviewer conducting a ${difficulty} level interview for a ${roleContext} position.
  
  USER CONTEXT:
  - Target Role: ${roleContext}
  - Experience Level: ${experienceLevel}
  - Resume Summary: ${resumeSummary}
  
  INTERVIEW INSTRUCTIONS:
  1. Start with a brief introduction and ask the candidate to tell you about themselves
  2. Ask relevant ${type?.toLowerCase() || 'technical'} questions based on their experience and the role
  3. BE ADAPTIVE:
  - If they give a vague answer, ask them to elaborate with specific examples
  - If they mention something interesting, ask a follow-up question to go deeper
  - If they struggle, give a subtle hint but don't give away the answer
  - If they ramble or go off-topic, politely redirect them
  4. Maintain a professional but slightly challenging tone (like a real senior engineer)
  5. Keep track of time - aim for 5-7 questions in 30 minutes
  6. Listen to their complete answer before deciding on the next question
  7. Ask one question at a time and wait for their response
  
  QUESTION STRATEGY:
  - Start with an easier warm-up question
  - Gradually increase difficulty based on their responses
  - Mix conceptual questions with practical scenario-based questions
  - Ask follow-ups when they mention projects or technologies
  - Probe for depth: "How did you handle X?", "What would you do differently?"
  
  Your goal is to have a natural, conversational interview - not to follow a rigid script. Begin the interview now.`;
  }