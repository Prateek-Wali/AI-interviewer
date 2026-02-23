import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/prisma";
import { generateInterviewReport } from "@/lib/gemini";

/**
 * GET /api/interviews/[id]/report
 * Returns the full interview report. Generates Analysis if not cached.
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
        console.log(`🔍 Report requested for interview: ${interviewId}`);

        // 1. Fetch interview with questions and existing analysis
        const interview = await db.interview.findUnique({
            where: { id: interviewId },
            include: {
                questions: { orderBy: { askedAt: "asc" } },
                analysis: true,
            },
        });

        console.log(`📋 Interview found: ${!!interview}, Questions: ${interview?.questions?.length ?? 0}`);

        if (!interview) {
            return NextResponse.json({ error: "Interview not found" }, { status: 404 });
        }

        if (interview.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // 2. If analysis already cached, return it
        if (interview.analysis) {
            console.log("📋 Returning cached report");
            return NextResponse.json({
                success: true,
                interview: {
                    id: interview.id,
                    type: interview.type,
                    difficulty: interview.difficulty,
                    startedAt: interview.startedAt,
                    endedAt: interview.endedAt,
                    durationSeconds: interview.durationSeconds,
                },
                questions: interview.questions.map(q => ({
                    id: q.id,
                    questionText: q.questionText,
                    questionType: q.questionType,
                    userResponse: q.userResponse,
                    responseDuration: q.responseDuration,
                    confidenceScore: q.confidenceScore,
                    fillerWordCount: q.fillerWordCount,
                    speakingRate: q.speakingRate,
                })),
                analysis: interview.analysis,
            });
        }

        // 3. Handle edge case: no questions recorded
        if (interview.questions.length === 0) {
            console.log("⚠️ Interview has 0 questions — returning minimal report");
            return NextResponse.json({
                success: true,
                interview: {
                    id: interview.id,
                    type: interview.type,
                    difficulty: interview.difficulty,
                    startedAt: interview.startedAt,
                    endedAt: interview.endedAt,
                    durationSeconds: interview.durationSeconds,
                },
                questions: [],
                analysis: {
                    overallScore: 0,
                    communicationScore: 0,
                    confidenceScore: 0,
                    strengths: [],
                    weaknesses: [],
                    improvements: [],
                    questionAnalysis: [],
                    summaryText: "Interview ended before any questions were answered.",
                },
            });
        }

        // 4. Generate report via Gemini
        console.log(`📊 Generating report for ${interview.questions.length} questions...`);
        const report = await generateInterviewReport(interview.questions);

        // 4. Build per-question analysis from existing scores
        const questionAnalysis = interview.questions.map(q => ({
            questionId: q.id,
            questionText: q.questionText,
            score: q.confidenceScore ?? 0,
            communicationScore: q.speakingRate ?? 0,
            duration: q.responseDuration ?? 0,
            fillerWords: q.fillerWordCount ?? 0,
        }));

        // 5. Save to Analysis table (cache for future loads)
        const analysis = await db.analysis.create({
            data: {
                interviewId,
                overallScore: report.overallScore,
                technicalScore: 0, // Not used for behavioral
                communicationScore: report.communicationScore,
                confidenceScore: report.confidenceScore,
                strengths: report.strengths,
                weaknesses: report.weaknesses,
                improvements: report.improvements,
                questionAnalysis,
                summaryText: report.summaryText,
            },
        });

        console.log("✅ Report saved to Analysis table");

        return NextResponse.json({
            success: true,
            interview: {
                id: interview.id,
                type: interview.type,
                difficulty: interview.difficulty,
                startedAt: interview.startedAt,
                endedAt: interview.endedAt,
                durationSeconds: interview.durationSeconds,
            },
            questions: interview.questions.map(q => ({
                id: q.id,
                questionText: q.questionText,
                questionType: q.questionType,
                userResponse: q.userResponse,
                responseDuration: q.responseDuration,
                confidenceScore: q.confidenceScore,
                fillerWordCount: q.fillerWordCount,
                speakingRate: q.speakingRate,
            })),
            analysis,
        });

    } catch (error) {
        console.error("Report generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate report", details: error instanceof Error ? error.message : "Unknown" },
            { status: 500 }
        );
    }
}
