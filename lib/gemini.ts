import { db } from "@/lib/prisma";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_REST_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface GeneratedQuestion {
    questionText: string;
    category: "resume_deep_dive" | "behavioral" | "situational";
    context: string;
    difficulty: "Easy" | "Medium" | "Hard";
}

// ─────────────────────────────────────────────
// Core: Generate Question Bank from Resume
// ─────────────────────────────────────────────

export async function generateQuestionBank(
    userId: string,
    resumeText: string
): Promise<GeneratedQuestion[]> {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    console.log("🧠 Calling Gemini REST API to generate question bank...");

    const prompt = buildPrompt(resumeText);

    const response = await fetch(GEMINI_REST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                responseMimeType: "application/json",
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Gemini REST API error:", errorText);
        throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = await response.json();

    // Extract the text content from Gemini's response
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
        throw new Error("No content in Gemini response");
    }

    // Parse the JSON array from the response
    const questions: GeneratedQuestion[] = JSON.parse(rawText);
    console.log(`✅ Generated ${questions.length} questions from resume`);

    return questions;
}

// ─────────────────────────────────────────────
// Save Questions to Database
// ─────────────────────────────────────────────

export async function saveQuestionBank(
    userId: string,
    questions: GeneratedQuestion[]
): Promise<void> {
    // 1. Delete any existing questions for this user (fresh set each upload)
    await db.questionBank.deleteMany({
        where: { userId },
    });

    // 2. Bulk-insert the new questions
    await db.questionBank.createMany({
        data: questions.map((q) => ({
            userId,
            questionText: q.questionText,
            category: q.category,
            context: q.context,
            difficulty: q.difficulty,
        })),
    });

    console.log(`💾 Saved ${questions.length} questions to QuestionBank for user ${userId}`);
}

// ─────────────────────────────────────────────
// Prompt Builder
// ─────────────────────────────────────────────

function buildPrompt(resumeText: string): string {
    return `You are an expert behavioral interview question designer. 

Given the candidate's resume below, generate exactly 8 interview questions.

CRITICAL RULES:
1. Generate EXACTLY 8 questions — no more, no less.
2. **5 questions MUST be resume-specific** — each one MUST explicitly reference a specific project name, technology, company, role, or experience mentioned in the resume. The candidate should immediately recognize that you read their resume.
3. **3 questions MUST be classic behavioral interview questions** — these are standard STAR-method questions that could be asked to ANY candidate. They must NOT reference ANYTHING from the resume. This is NON-NEGOTIABLE.
4. Distribute the 5 resume-specific questions as:
   - 3 questions: "resume_deep_dive" — drill into specific projects, technical decisions, or claims on the resume. Name the actual project or technology.
   - 2 questions: "situational" — hypothetical scenarios that directly reference the candidate's specific tech stack or domain from the resume
5. The 3 generic behavioral questions should all be category "behavioral". Pick 3 from the following list (or write ones very similar in spirit):
   - "Tell me about a time you had to explain a complex technical concept to someone non-technical — a teammate, a manager, or a client. How did you approach it, and how did you know they understood?"
   - "Describe a situation where you received critical feedback on your work. How did you respond, and what did you change?"
   - "Tell me about a time you failed at something important. What happened, and what did you learn from it?"
   - "Give me an example of a time you had to work with someone whose working style was very different from yours. How did you handle it?"
   - "Tell me about a time you had to meet a tight deadline. How did you prioritize your work and what was the outcome?"
   - "Describe a situation where you had to make a decision without having all the information you wanted. What did you do?"
   - "Tell me about a time you went above and beyond what was expected of you."
   - "Give me an example of a time you had a conflict with a coworker. How did you resolve it?"
   - "Tell me about a time you had to learn a new skill quickly to complete a task or project."
   - "Describe a situation where you took the lead on a team project. What challenges did you face?"
6. Vary the difficulty: 2 Easy, 4 Medium, 2 Hard.
7. For each question, include a "context" field explaining WHY you chose this question based on their resume (for resume-specific) or why it's important (for generic behavioral).
8. ORDERING: Place the questions in this order — start with 2 behavioral questions, then alternate resume-specific questions, and end with the 3rd behavioral question. This creates a natural interview flow.

⚠️ STRICT WARNING: The 3 behavioral questions must be COMPLETELY GENERIC. They must NOT mention any project, company, technology, or detail from the resume. If a behavioral question references the resume in any way, it is WRONG.

EXAMPLES OF GOOD RESUME-SPECIFIC QUESTIONS:
- "You listed a React dashboard project that handled real-time data. Walk me through the architecture decisions you made and why."
- "I see you used PostgreSQL with Prisma in your Lintrvw project. What were the tradeoffs of using an ORM vs raw SQL for this use case?"
- "You mentioned leading a team of 4 at XYZ Corp. How did you handle task delegation and code reviews?"

EXAMPLES OF BAD (GENERIC) QUESTIONS THAT SHOULD NOT COUNT AS RESUME-SPECIFIC:
- "Tell me about a challenging project you worked on" (too vague, doesn't name anything)
- "How do you approach debugging?" (could be asked to anyone)
- "Describe your experience with web development" (doesn't reference specific resume content)

CANDIDATE RESUME:
"""
${resumeText.substring(0, 8000)}
"""

Respond with a JSON array of exactly 8 objects. Each object must have:
- "questionText": the full interview question as a string
- "category": one of "resume_deep_dive", "behavioral", "situational"  
- "context": a brief explanation of why this question was chosen
- "difficulty": one of "Easy", "Medium", "Hard"

Return ONLY the JSON array, no other text.`;
}

// ─────────────────────────────────────────────
// Answer Evaluation (Silent Background Scoring)
// ─────────────────────────────────────────────

export interface AnswerEvaluation {
    overallScore: number;        // 0-100
    communicationScore: number;  // 0-100
    confidenceScore: number;     // 0-100
    fillerWordCount: number;
    usedStarMethod: boolean;
    feedback: string;            // Detailed feedback for post-interview report
}

export async function evaluateAnswer(
    questionText: string,
    userAnswer: string,
    category: string,
    durationSeconds: number
): Promise<AnswerEvaluation> {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set");
    }

    console.log("🧪 Evaluating answer in background...");

    const prompt = buildEvaluationPrompt(questionText, userAnswer, category, durationSeconds);

    const response = await fetch(GEMINI_REST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.3,
                responseMimeType: "application/json",
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Evaluation API error:", errorText);
        throw new Error(`Evaluation failed: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
        throw new Error("No evaluation content in Gemini response");
    }

    const evaluation: AnswerEvaluation = JSON.parse(rawText);
    console.log(`✅ Evaluation complete — Score: ${evaluation.overallScore}/100`);

    return evaluation;
}

function buildEvaluationPrompt(
    questionText: string,
    userAnswer: string,
    category: string,
    durationSeconds: number
): string {
    const wordCount = userAnswer.split(/\s+/).length;
    const wpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;

    return `You are an expert interview evaluator. Score the candidate's answer to the following question.

QUESTION: "${questionText}"
CATEGORY: ${category}
CANDIDATE'S ANSWER: "${userAnswer}"
ANSWER DURATION: ${durationSeconds} seconds (${wordCount} words, ~${wpm} WPM)

SCORING CRITERIA:
- overallScore (0-100): How well did the answer address the question? Was it specific, detailed, and relevant?
- communicationScore (0-100): Clarity, structure, and articulation. Did they organize their thoughts?
- confidenceScore (0-100): Based on word choice, filler word usage, and directness. Hesitant answers score lower.
- fillerWordCount: Count occurrences of filler words (um, uh, like, you know, sort of, kind of, basically, actually, literally)
- usedStarMethod: true if the answer followed Situation-Task-Action-Result structure, false otherwise
- feedback: 2-3 sentences of constructive feedback. Be specific. Mention what they did well AND what to improve.

SCORING GUIDE:
- 90-100: Exceptional — specific, structured, compelling
- 70-89: Good — solid answer with minor gaps
- 50-69: Average — answered but lacked depth or specifics
- 30-49: Weak — vague, generic, or off-topic
- 0-29: Poor — no real answer or completely irrelevant

Respond with a single JSON object matching this exact schema:
{
  "overallScore": number,
  "communicationScore": number,
  "confidenceScore": number,
  "fillerWordCount": number,
  "usedStarMethod": boolean,
  "feedback": "string"
}`;
}

// ─────────────────────────────────────────────
// Interview Report Generation
// ─────────────────────────────────────────────

export interface InterviewReport {
    overallScore: number;
    communicationScore: number;
    confidenceScore: number;
    strengths: { title: string; description: string }[];
    weaknesses: { title: string; description: string }[];
    improvements: { topic: string; suggestion: string }[];
    summaryText: string;
}

export async function generateInterviewReport(
    questions: {
        questionText: string;
        questionType: string;
        userResponse: string | null;
        responseDuration: number | null;
        confidenceScore: number | null;
        fillerWordCount: number | null;
        speakingRate: number | null; // repurposed as communicationScore
    }[]
): Promise<InterviewReport> {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set");
    }

    console.log("📊 Generating interview report...");

    const questionsContext = questions
        .map((q, i) => {
            return `Question ${i + 1}: "${q.questionText}"
Answer: "${q.userResponse || 'No answer recorded'}"
Duration: ${q.responseDuration || 0}s
Confidence Score: ${q.confidenceScore ?? 'N/A'}
Communication Score: ${q.speakingRate ?? 'N/A'}
Filler Words: ${q.fillerWordCount ?? 0}`;
        })
        .join("\n\n");

    const prompt = `You are an expert interview coach. Analyze the following completed behavioral interview and generate a comprehensive report.

INTERVIEW DATA:
${questionsContext}

Generate a JSON report with:
1. "overallScore": 0-100, weighted average of all question scores
2. "communicationScore": 0-100, average clarity and articulation across all answers
3. "confidenceScore": 0-100, average confidence across all answers
4. "strengths": array of exactly 3 objects with "title" and "description" — what the candidate did well
5. "weaknesses": array of exactly 3 objects with "title" and "description" — areas that need work
6. "improvements": array of exactly 3 objects with "topic" and "suggestion" — actionable next steps
7. "summaryText": A 2-3 sentence overall summary of the interview performance

Be specific and reference actual answers. Do not give generic feedback.

Respond with ONLY a JSON object matching this schema:
{
  "overallScore": number,
  "communicationScore": number,
  "confidenceScore": number,
  "strengths": [{"title": "string", "description": "string"}],
  "weaknesses": [{"title": "string", "description": "string"}],
  "improvements": [{"topic": "string", "suggestion": "string"}],
  "summaryText": "string"
}`;

    const response = await fetch(GEMINI_REST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.4,
                responseMimeType: "application/json",
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Report generation error:", errorText);
        throw new Error(`Report generation failed: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
        throw new Error("No report content in Gemini response");
    }

    const report: InterviewReport = JSON.parse(rawText);
    console.log(`✅ Report generated — Overall: ${report.overallScore}/100`);

    return report;
}

// ─────────────────────────────────────────────
// Response Classification (3-Way: Answer / Meta-Request / Small Talk)
// ─────────────────────────────────────────────

export type ResponseClassification = "ANSWER" | "META_REQUEST" | "SMALL_TALK";

/**
 * Classifies whether a user's speech is:
 * - "ANSWER"       → A real interview answer (save + evaluate)
 * - "META_REQUEST"  → Asking to repeat/clarify (skip saving, reuse question)
 * - "SMALL_TALK"    → Greetings, pleasantries, chit-chat (delete question record)
 *
 * Short-circuits for long responses (>50 words) — those are always real answers.
 */
export async function classifyResponse(userResponse: string): Promise<ResponseClassification> {
    // Short-circuit: long responses are always real answers
    const wordCount = userResponse.trim().split(/\s+/).length;
    if (wordCount > 50) {
        console.log("⚡ Classification short-circuit: long response, treating as answer");
        return "ANSWER";
    }

    if (!GEMINI_API_KEY) {
        console.warn("⚠️ No API key for classification, defaulting to answer");
        return "ANSWER";
    }

    try {
        const prompt = `You are classifying a user's speech during a job interview.

Classify the following text into EXACTLY one of three categories:

ANSWER — The user is attempting to respond to an interview question, even if the answer is short, vague, or incomplete.

META_REQUEST — The user is NOT answering a question. Instead they are:
- Asking the interviewer to repeat the question
- Asking for clarification about what was asked
- Expressing confusion about the question
- Requesting more time to think
- Saying they didn't hear or understand

SMALL_TALK — The user is engaging in casual conversation, greetings, or pleasantries that are NOT an interview answer. Examples:
- "I'm doing great, thanks!"
- "Good, how about you?"
- "Nice to meet you too"
- "I'm good"
- "Hey, thanks for having me"
- "Yeah I'm ready, let's do it"
- Any greeting, pleasantry, or chit-chat before the interview questions begin

User's speech: "${userResponse}"

Respond with ONLY one word: "ANSWER", "META_REQUEST", or "SMALL_TALK".`;

        const response = await fetch(GEMINI_REST_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0,
                },
            }),
        });

        if (!response.ok) {
            console.warn("⚠️ Classification API error, defaulting to answer");
            return "ANSWER";
        }

        const data = await response.json();
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        if (result.includes("SMALL_TALK")) {
            console.log(`🏷️ Response classified as: SMALL_TALK (will delete question record)`);
            return "SMALL_TALK";
        } else if (result.includes("META_REQUEST")) {
            console.log(`🏷️ Response classified as: META_REQUEST (will skip saving)`);
            return "META_REQUEST";
        } else {
            console.log(`🏷️ Response classified as: ANSWER (will save)`);
            return "ANSWER";
        }
    } catch (err) {
        console.error("❌ Classification error, defaulting to answer:", err);
        return "ANSWER";
    }
}
