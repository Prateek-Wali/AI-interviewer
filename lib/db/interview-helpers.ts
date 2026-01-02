// lib/db/interview-helpers.ts

// 1. Import the singleton 'db' client we created earlier
//    (We rename it to 'prisma' here so we don't have to change the code below)
import { db as prisma } from "../prisma"; 

import { InterviewType, InterviewStatus } from "@prisma/client";

// ============================================
// INTERVIEW OPERATIONS
// ============================================

/**
 * Create a new interview session defalut is 30 mins rn
 */
export async function createInterview(data: {
  userId: string;
  type: InterviewType;
  difficulty: string;
  targetDuration?: number;
}) {
  return await prisma.interview.create({
    data: {
      userId: data.userId,
      type: data.type,
      difficulty: data.difficulty,
      targetDuration: data.targetDuration || 1800, // Default 30 min
      status: "IN_PROGRESS",
    },
  });
}

/**
 * Get interview by ID with all related data
 */
export async function getInterviewById(interviewId: string) {
  return await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      questions: {
        orderBy: { askedAt: "asc" }, // Chronological order
      },
      analysis: true,
      user: {
        include: {
          userPreferences: true,
        },
      },
    },
  });
}

/**
 * Update interview status (e.g., when ending interview) calulates duration
 * if ended early 
 */
export async function updateInterviewStatus(
  interviewId: string,
  status: InterviewStatus,
  endedAt?: Date
) {
  const updateData: any = { status };
  
  if (endedAt) {
    updateData.endedAt = endedAt;
    
    // Calculate duration
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      select: { startedAt: true },
    });
    
    if (interview) {
      const durationMs = endedAt.getTime() - interview.startedAt.getTime();
      updateData.durationSeconds = Math.floor(durationMs / 1000);
    }
  }
  
  return await prisma.interview.update({
    where: { id: interviewId },
    data: updateData,
  });
}

// ============================================
// QUESTION OPERATIONS
// ============================================

/**
 * Create a new question (called when AI asks a question)
 */
export async function createQuestion(data: {
  interviewId: string;
  questionText: string;
  questionType: string;
}) {
  return await prisma.question.create({
    data: {
      interviewId: data.interviewId,
      questionText: data.questionText,
      questionType: data.questionType,
      askedAt: new Date(),
    },
  });
}

/**
 * Update question with user's response and metrics
 */
export async function updateQuestionResponse(
  questionId: string,
  data: {
    userResponse: string;
    responseDuration: number;
    responseStartTime?: number;
    responseEndTime?: number;
    fillerWordCount?: number;
    pauseCount?: number;
    avgPauseDuration?: number;
    speakingRate?: number;
    confidenceScore?: number;
  }
) {
  return await prisma.question.update({
    where: { id: questionId },
    data: {
      userResponse: data.userResponse,
      responseDuration: data.responseDuration,
      responseStartTime: data.responseStartTime,
      responseEndTime: data.responseEndTime,
      fillerWordCount: data.fillerWordCount || 0,
      pauseCount: data.pauseCount || 0,
      avgPauseDuration: data.avgPauseDuration || 0,
      speakingRate: data.speakingRate || 0,
      confidenceScore: data.confidenceScore || 75, // Default neutral score
    },
  });
}

/**
 * Get all questions for an interview
 */
export async function getInterviewQuestions(interviewId: string) {
  return await prisma.question.findMany({
    where: { interviewId },
    orderBy: { askedAt: "asc" },
  });
}

// ============================================
// USER PREFERENCES
// ============================================

/**
 * Get or create user preferences
 */
export async function getUserPreferences(userId: string) {
  let prefs = await prisma.userPreferences.findUnique({
    where: { userId },
  });
  
  // Create default preferences if they don't exist
  if (!prefs) {
    prefs = await prisma.userPreferences.create({
      data: {
        userId,
        experienceLevel: "Entry",
        targetRole: "Software Engineer",
      },
    });
  }
  
  return prefs;
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  data: {
    resumeText?: string;
    targetRole?: string;
    targetCompany?: string;
    experienceLevel?: string;
  }
) {
  return await prisma.userPreferences.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  });
}

// ============================================
// ANALYSIS OPERATIONS
// ============================================

/**
 * Create analysis results for an interview
 */
export async function createAnalysis(data: {
  interviewId: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  strengths: any[];
  weaknesses: any[];
  improvements: any[];
  questionAnalysis: any[];
  summaryText: string;
  percentileRank?: number;
}) {
  return await prisma.analysis.create({
    data: {
      interviewId: data.interviewId,
      overallScore: data.overallScore,
      technicalScore: data.technicalScore,
      communicationScore: data.communicationScore,
      confidenceScore: data.confidenceScore,
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      improvements: data.improvements,
      questionAnalysis: data.questionAnalysis,
      summaryText: data.summaryText,
      percentileRank: data.percentileRank,
    },
  });
}

/**
 * Get analysis for an interview
 */
export async function getAnalysis(interviewId: string) {
  return await prisma.analysis.findUnique({
    where: { interviewId },
  });
}
export { prisma };