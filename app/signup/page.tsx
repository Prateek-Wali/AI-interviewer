"use client";

import { useState, useEffect } from "react";
import { createClient } from "../utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); 
  
  const router = useRouter();
  const supabase = createClient();

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

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
      setSuccess(true);
      setTimeLeft(120); 
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // IMPORTANT: Send new users to Pricing
        redirectTo: `${window.location.origin}/auth/callback?next=/pricing`,
      },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError(null);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/pricing`,
      },
    });

    if (error) {
      setError("Error resending: " + error.message);
    } else {
      setTimeLeft(120);
      alert("Email resent! Please check your inbox.");
    }
    setResendLoading(false);
  };

  // --- SUCCESS SCREEN (Check Email) ---
  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
        {/* Master Background */}
        <div className="fixed inset-0 -z-50 h-full w-full bg-white">
           <div className="absolute h-full w-full bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
           <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-slow"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-medium"></div>
           <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-cyan-50/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-fast"></div>
        </div>

        <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-8 text-center relative z-10">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            ✉️
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
          <p className="text-slate-600 mb-8">
            We sent a confirmation link to <span className="font-bold text-slate-900">{email}</span>.
            <br />
            Click it to activate your account.
          </p>

          <button 
            onClick={handleResend}
            disabled={timeLeft > 0 || resendLoading}
            className="text-blue-600 font-bold hover:underline disabled:text-slate-400 disabled:no-underline"
          >
            {resendLoading ? "Sending..." : timeLeft > 0 ? `Resend email in ${timeLeft}s` : "Resend Email"}
          </button>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
             <button onClick={() => setSuccess(false)} className="text-sm text-slate-400 hover:text-slate-600">
               Use a different email
             </button>
          </div>
        </div>
      </main>
    );
  }

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

      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-8 relative z-10">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-500">Start your interview prep today.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* GOOGLE BUTTON */}
        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-lg transition-all mb-6 shadow-sm"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Sign up with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/50 backdrop-blur-sm text-slate-500">Or sign up with email</span>
          </div>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white/50"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white/50"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Log in here
          </Link>
        </p>

      </div>
    </main>
  );
}