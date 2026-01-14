'use server'

import { createClient } from "@/app/utils/supabase/server";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";

// DELETE THE REQUIRE FROM HERE
// const pdfParse = require("pdf-parse");  <-- REMOVE THIS LINE

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

  try {
    if (file.type === "application/pdf") {
      // MOVED INSIDE: Only load the library when we are ready to use it
      const pdfParse = require("pdf-parse/lib/pdf-parse.js");
      
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

    // 5. Save to Database
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

  } catch (error) {
    console.error("Resume parsing error:", error);
  }

  // 6. Redirect to Interview
  redirect("/interview");
}