'use server'

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/prisma";
import { generateQuestionBank, saveQuestionBank } from "@/lib/gemini";
import { checkInterviewLimit } from "@/lib/limits";

export async function uploadResume(formData: FormData) {
  // 1. Authenticate User
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // 1.5. Check interview limit
  const limitCheck = await checkInterviewLimit(user.id);
  if (!limitCheck.allowed) {
    return { error: `You have reached your monthly limit of ${limitCheck.limit} interviews.` };
  }

  // 2. Get the file
  const file = formData.get("resume") as File;
  if (!file) {
    return { error: "No file uploaded" };
  }

  // 2.5 Check file size (max 5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File size exceeds the 5MB limit. Please upload a smaller resume." };
  }

  // 3. Extract Text based on file type
  let extractedText = "";

  if (file.type === "application/pdf") {
    const pdfParse = require("pdf-parse/lib/pdf-parse");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdfParse(buffer);
    extractedText = data.text;
  } else if (file.type === "text/plain") {
    extractedText = await file.text();
  } else {
    return { error: "Only PDF or TXT files are supported" };
  }

  // 4. Clean the text
  extractedText = extractedText.replace(/\n+/g, " ").trim();

  if (!extractedText || extractedText.length < 50) {
    return { error: "Could not extract enough text from the resume. Please try a different file." };
  }

  console.log(`📄 Resume parsed: ${extractedText.length} characters extracted`);

  // 5. Save resume to Database
  await db.userPreferences.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      resumeText: extractedText,
      experienceLevel: "Entry",
      targetRole: "Software Engineer"
    },
    update: {
      resumeText: extractedText,
    }
  });

  // 6. Generate Question Bank from Resume
  console.log("📋 Generating question bank from resume...");
  const questions = await generateQuestionBank(user.id, extractedText);
  await saveQuestionBank(user.id, questions);
  console.log(`✅ Question bank ready! ${questions.length} questions saved.`);

  // 7. Return success so client can redirect
  return { success: true };
}