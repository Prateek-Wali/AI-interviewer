import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/prisma";

/**
 * GET /api/interviews/history
 * Returns all completed interviews for the authenticated user,
 * ordered by most recent first, with analysis scores and question count.
 */
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const interviews = await db.interview.findMany({
            where: {
                userId: user.id,
                status: "COMPLETED",
            },
            orderBy: { startedAt: "desc" },
            include: {
                analysis: {
                    select: {
                        overallScore: true,
                        communicationScore: true,
                        confidenceScore: true,
                        summaryText: true,
                    },
                },
                _count: {
                    select: { questions: true },
                },
            },
        });

        const history = interviews.map((interview) => ({
            id: interview.id,
            type: interview.type,
            difficulty: interview.difficulty,
            startedAt: interview.startedAt,
            endedAt: interview.endedAt,
            durationSeconds: interview.durationSeconds,
            questionCount: interview._count.questions,
            overallScore: interview.analysis?.overallScore ?? null,
            communicationScore: interview.analysis?.communicationScore ?? null,
            confidenceScore: interview.analysis?.confidenceScore ?? null,
            summaryText: interview.analysis?.summaryText ?? null,
        }));

        return NextResponse.json({ success: true, interviews: history });

    } catch (error) {
        console.error("History fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch history", details: error instanceof Error ? error.message : "Unknown" },
            { status: 500 }
        );
    }
}
