"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadResume } from "./action";

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // We wrap the server action to handle loading state on the client
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await uploadResume(formData);
      
      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      
      if (result?.success) {
        router.push("/interview");
      }
    } catch (err: any) {
      setError("Failed to process resume. Please try again or check your connection.");
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="min-h-screen relative font-inter text-[#1f2328] flex items-center justify-center p-4">

      {/* --- BACKGROUND (Matches Dashboard) --- */}
      <div className="fixed inset-0 -z-50 h-full w-full bg-white">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-medium"></div>
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-cyan-50/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-fast"></div>
      </div>

      {/* --- CARD --- */}
      <div className="w-full max-w-[480px] relative">
        {/* Top accent bar */}
        <div className="h-[2px] rounded-t-lg" style={{ background: 'linear-gradient(90deg, #1a7f37, #0969da)' }}></div>

        <div className="bg-white border border-[#d0d7de] border-t-0 rounded-b-lg px-9 py-10" style={{ boxShadow: '0 1px 3px rgba(140,149,159,0.15)' }}>

          {/* Icon + Heading */}
          <div className="text-center mb-7">
            <div className="w-10 h-10 bg-[#f6f8fa] border border-[#d0d7de] rounded-lg flex items-center justify-center mx-auto mb-5">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="6" width="12" height="2" rx="1" fill="#8c959f" />
                <rect x="4" y="11" width="18" height="2" rx="1" fill="#8c959f" />
                <rect x="4" y="16" width="14" height="2" rx="1" fill="#8c959f" />
                <path d="M4 21 Q5.5 19.5 7 21 Q8.5 22.5 10 21 Q11.5 19.5 13 21 Q14.5 22.5 16 21 Q17.5 19.5 19 21 Q20.5 22.5 22 21"
                  stroke="#cf222e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="font-mono font-bold text-xl tracking-tight text-[#1f2328]">Context Check</h1>
            <p className="text-sm text-[#636c76] text-center mt-1">
              Upload your resume so the AI knows what to ask you.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-[#ffebe9] border border-[#cf222e]/20 text-[#cf222e] font-mono text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Dropzone */}
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
              {fileName ? (
                <div className="bg-[#f6f8fa] border-[1.5px] border-solid border-[#1a7f37] rounded-md px-5 py-4 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-[#1a7f37] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-mono text-sm font-medium text-[#1f2328]">{fileName}</span>
                </div>
              ) : (
                <div className="border-[1.5px] border-dashed border-[#d0d7de] rounded-md px-5 py-6 text-center transition-all duration-150 group-hover:border-[#0969da] group-hover:bg-[#f6f8fa]">
                  <svg className="w-6 h-6 text-[#8c959f] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="font-mono text-sm text-[#636c76]">Click to upload or drag & drop</p>
                  <p className="font-mono text-xs text-[#8c959f] mt-1">PDF or TXT supported</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-md font-mono font-semibold text-sm text-white flex items-center justify-center gap-2 transition-colors duration-150 ${loading
                  ? 'bg-[#8c959f] border border-[rgba(27,31,36,0.1)] cursor-not-allowed opacity-80'
                  : 'bg-[#1a7f37] border border-[rgba(27,31,36,0.15)] hover:bg-[#1c8139]'
                }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing Resume...
                </>
              ) : (
                "Continue to Camera Check →"
              )}
            </button>
          </form>

          {/* Disclaimer */}
          <p className="flex items-center justify-center gap-1.5 font-mono text-xs text-[#8c959f] text-center mt-5">
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            We extract text only to generate relevant interview questions.
          </p>

        </div>
      </div>
    </div>
  );
}