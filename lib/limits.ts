import { db } from "@/lib/prisma";

export async function checkInterviewLimit(userId: string): Promise<{ allowed: boolean; count: number; limit: number }> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const count = await db.interview.count({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth
      }
    }
  });

  const limit = 10;
  return {
    allowed: count < limit,
    count,
    limit
  };
}
