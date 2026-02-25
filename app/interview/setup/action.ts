'use server'

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { generateQuestionBank, saveQuestionBank } from "@/lib/gemini";

export async function uploadResume(formData: FormData) {
  // 1. Authenticate User
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // 2. Get the file
  const file = formData.get("resume") as File;
  if (!file) {
    throw new Error("No file uploaded");
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
    throw new Error("Only PDF or TXT files are supported");
  }

  // 4. Clean the text
  extractedText = extractedText.replace(/\n+/g, " ").trim();

  if (!extractedText || extractedText.length < 50) {
    throw new Error("Could not extract enough text from the resume. Please try a different file.");
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

  // 7. Redirect to Interview (only runs if everything above succeeded)
  redirect("/interview");
}