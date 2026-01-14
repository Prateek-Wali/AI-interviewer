"use client";

import { useState } from "react";
import { uploadResume } from "./action";

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // We wrap the server action to handle loading state on the client
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    
    const formData = new FormData(event.currentTarget);
    await uploadResume(formData); // This will redirect on success
    
    // If we get here, it means there was an error or the redirect hasn't happened yet
    // In a production app, we'd handle error returns here.
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="min-h-screen relative font-sans text-slate-900 flex items-center justify-center p-4">
      
      {/* --- BACKGROUND (Matches your Dashboard) --- */}
      <div className="fixed inset-0 -z-50 h-full w-full bg-white">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob animation-delay-2000"></div>
      </div>

      {/* --- CARD UI --- */}
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
            <span className="text-3xl">📄</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Context Check</h1>
          <p className="text-slate-500">
            Upload your resume so the AI knows what to grill you on.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="relative group">
            <input 
              type="file" 
              name="resume" 
              id="resume"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              required 
            />
            <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${fileName ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}>
              
              {fileName ? (
                <div className="text-blue-600 font-semibold flex items-center justify-center gap-2">
                  <span>✅</span> {fileName}
                </div>
              ) : (
                <>
                  <p className="text-slate-900 font-bold mb-1">Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-500">PDF or TXT (Max 5MB)</p>
                </>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all transform hover:scale-[1.02] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Resume...
              </>
            ) : (
              "Continue to Camera Check →"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          We extract text only to generate relevant interview questions.
        </p>

      </div>
    </div>
  );
}