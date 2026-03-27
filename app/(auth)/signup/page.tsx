"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // IMPORTANT: Send new users to Pricing
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/pricing`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/pricing");
      router.refresh();
    }
  };


  const handleGoogleLogin = async () => {
    setLoading(true);
    
    // Force clear any stale session/cookies to prevent race condition with background refresh
    await supabase.auth.signOut();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Signup goes to Pricing
        redirectTo: `${window.location.origin}/auth/callback?next=/pricing`,
      },
    });
    if (error) setError(error.message);
    setLoading(false);
  };



  // --- MAIN SIGNUP FORM ---
  return (
    <main className="min-h-screen flex items-center justify-center relative p-4 overflow-hidden">

      {/* --- MASTER BACKGROUND (Restored) --- */}
      <div className="fixed inset-0 -z-50 h-full w-full bg-white">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-medium"></div>
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-cyan-50/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-fast"></div>
      </div>

      <div className="w-full max-w-md bg-white border border-[#d0d7de] rounded-[8px] p-8 relative z-10 shadow-[0_1px_3px_rgba(140,149,159,0.15)]">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[linear-gradient(90deg,#1a7f37,#0969da)] rounded-t-[8px]"></div>

        <div className="text-center mb-8">
          <h1 className="font-mono font-bold text-2xl tracking-tight text-[#1f2328] mb-2">Create Account</h1>
          <p className="text-sm text-[#636c76] mt-1">Start your interview prep today.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* GOOGLE BUTTON */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white border border-[#d0d7de] rounded-[6px] py-[10px] px-[16px] hover:bg-[#f6f8fa] hover:border-[#8c959f] transition-all duration-150 mb-6 font-mono font-medium text-sm text-[#1f2328]"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Sign up with Google
        </button>

        <div className="flex items-center w-full mb-6 relative">
          <div className="flex-grow border-t border-[#eaeef2]"></div>
          <span className="px-4 bg-white font-mono text-xs text-[#8c959f] tracking-wide relative z-10">Or continue with email</span>
          <div className="flex-grow border-t border-[#eaeef2]"></div>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-[#1f2328] mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#d0d7de] rounded-[6px] py-[8px] px-[12px] font-mono text-sm text-[#1f2328] placeholder:text-[#8c959f] hover:border-[#8c959f] focus:border-[#0969da] focus:outline focus:outline-2 focus:outline-[rgba(9,105,218,0.1)] transition-colors duration-150"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-[#1f2328] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#d0d7de] rounded-[6px] py-[8px] px-[12px] font-mono text-sm text-[#1f2328] placeholder:text-[#8c959f] hover:border-[#8c959f] focus:border-[#0969da] focus:outline focus:outline-2 focus:outline-[rgba(9,105,218,0.1)] transition-colors duration-150"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a7f37] hover:bg-[#1c8139] border border-[rgba(27,31,36,0.15)] rounded-[6px] py-[10px] px-[16px] text-white font-mono font-semibold text-sm tracking-wide transition-colors duration-150 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#636c76]">
          Already have an account?{" "}
          <Link href="/login" className="font-mono text-xs text-[#0969da] hover:underline">
            Log in here
          </Link>
        </p>

      </div>
    </main>
  );
}