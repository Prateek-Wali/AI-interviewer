import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateInterviewStatus } from "@/lib/db/interview-helpers";
import { db } from "@/lib/prisma";

/**
 * POST /api/interviews/[id]/end
 * Called when the user ends the interview session.
 * Updates the interview status to COMPLETED and records the end time.
 */
export async function POST(
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

        // Verify ownership
        const interview = await db.interview.findUnique({
            where: { id: interviewId },
            select: { userId: true },
        });

        if (!interview || interview.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const endedAt = body.endedAt ? new Date(body.endedAt) : new Date();

        const updated = await updateInterviewStatus(interviewId, "COMPLETED", endedAt);

        return NextResponse.json({
            success: true,
            interview: updated,
            message: "Interview ended successfully",
        });

    } catch (error) {
        console.error("Error ending interview:", error);
        return NextResponse.json(
            { error: "Failed to end interview", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
