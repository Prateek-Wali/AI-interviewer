"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '../utils/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resend Timer States
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // 0 means ready to send

  const supabase = createClient();

  // 1. Timer Logic: Counts down if timeLeft > 0
  useEffect(() => {
    if (timeLeft === 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  // 2. Initial Sign Up Logic
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeLeft(120); // Start 2 minute timer immediately
    }
  };

  // 3. Resend Logic
  const handleResend = async () => {
    setResendLoading(true);
    setError(null);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError("Error resending: " + error.message);
    } else {
      setTimeLeft(120); // Reset timer back to 2 minutes
      alert("Email resent! Please check your inbox and spam folder.");
    }
    setResendLoading(false);
  };

  // Helper to format seconds into mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-50 h-full w-full bg-white">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/60 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100/60 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl shadow-xl mx-4">
        
        {success ? (
          /* --- SUCCESS STATE WITH RESEND --- */
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              ✉️
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Check your email</h2>
            <p className="text-slate-600 mb-6">
              We sent a verification link to <span className="font-bold text-slate-900">{email}</span>.
              <br/>Please click the link to activate your account.
            </p>

            {/* Error Message for Resend (if any) */}
            {error && (
              <div className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {/* Resend Button */}
            <div className="space-y-4">
              <button 
                onClick={handleResend}
                disabled={timeLeft > 0 || resendLoading}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                {resendLoading ? 'Sending...' : timeLeft > 0 
                  ? `Resend available in ${formatTime(timeLeft)}` 
                  : 'Didn\'t receive it? Resend Email'}
              </button>

              <Link href="/login" className="block">
                <button className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all">
                  Return to Login
                </button>
              </Link>
            </div>
          </div>
        ) : (
          /* --- SIGN UP FORM (Same as before) --- */
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
              <p className="text-slate-500 mt-2">Start your interview prep today.</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-slate-200">
              <p className="text-slate-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">
                  Log in here
                </Link>
              </p>
            </div>
          </>
        )}

      </div>
    </main>
  );
}