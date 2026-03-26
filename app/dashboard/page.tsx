import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/prisma";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // Get first name for welcome message
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || "Developer";

  // Default stats (for unauthenticated or new users)
  let stats = {
    totalInterviews: 0,
    interviewsThisMonth: 0,
    avgScore: null as number | null,
    totalMinutes: 0,
    streak: 0,
  };
  let recentInterviews: {
    id: string;
    type: string;
    difficulty: string;
    startedAt: string;
    durationSeconds: number | null;
    questionCount: number;
    overallScore: number | null;
    summaryText: string | null;
  }[] = [];
  let activityMap: Record<string, number> = {};

  if (userId) {
    // 1. Total completed interviews
    const totalInterviews = await db.interview.count({
      where: { userId, status: "COMPLETED" },
    });

    // 1.5 Total interviews this month (all statuses)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const interviewsThisMonth = await db.interview.count({
      where: { userId, createdAt: { gte: startOfMonth } },
    });

    // 2. All completed interviews (for score avg, total time, streak, recent)
    const completedInterviews = await db.interview.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { startedAt: "desc" },
      include: {
        analysis: {
          select: {
            overallScore: true,
            summaryText: true,
          },
        },
        _count: {
          select: { questions: true },
        },
      },
    });

    // 3. Average score
    const scores = completedInterviews
      .map(i => i.analysis?.overallScore)
      .filter((s): s is number => s != null);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    // 4. Total practice time (in minutes)
    const totalSeconds = completedInterviews.reduce(
      (sum, i) => sum + (i.durationSeconds ?? 0), 0
    );
    const totalMinutes = Math.floor(totalSeconds / 60);

    // 5. Current streak — consecutive days with at least one completed interview
    const interviewDates = new Set(
      completedInterviews.map(i =>
        i.startedAt.toISOString().split("T")[0]
      )
    );
    let streak = 0;
    const today = new Date();
    // Start checking from today
    for (let d = 0; d < 365; d++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - d);
      const dateStr = checkDate.toISOString().split("T")[0];
      if (interviewDates.has(dateStr)) {
        streak++;
      } else if (d === 0) {
        // If no interview today, that's ok — still check yesterday
        continue;
      } else {
        break;
      }
    }

    // 6. Recent interviews (last 5)
    recentInterviews = completedInterviews.slice(0, 5).map(i => ({
      id: i.id,
      type: i.type,
      difficulty: i.difficulty,
      startedAt: i.startedAt.toISOString(),
      durationSeconds: i.durationSeconds,
      questionCount: i._count.questions,
      overallScore: i.analysis?.overallScore ?? null,
      summaryText: i.analysis?.summaryText ?? null,
    }));

    // 7. Activity heatmap — last 84 days (12 weeks)
    const heatmapStart = new Date(today);
    heatmapStart.setDate(today.getDate() - 83);
    heatmapStart.setHours(0, 0, 0, 0);
    for (const interview of completedInterviews) {
      if (interview.startedAt >= heatmapStart) {
        const dateStr = interview.startedAt.toISOString().split("T")[0];
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      }
    }

    stats = { totalInterviews, interviewsThisMonth, avgScore, totalMinutes, streak };
  }

  return (
    <DashboardContent
      firstName={firstName}
      stats={stats}
      recentInterviews={recentInterviews}
      activityMap={activityMap}
    />
  );
}