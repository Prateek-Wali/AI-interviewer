"use client"; // <--- 1. REQUIRED for interactivity

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../utils/supabase/client'; // Adjust path if needed

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // --- 2. THE GOOGLE LOGIN LOGIC ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This tells Supabase where to send the user after they login
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Login error:', error.message);
      setLoading(false);
    }
    // If no error, Supabase redirects the user to Google automatically.
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      
      {/* BACKGROUND (Same as before) */}
      <div className="fixed inset-0 -z-50 h-full w-full bg-white">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/60 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100/60 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl shadow-xl mx-4">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Please enter your details to sign in.</p>
        </div>

        {/* --- 3. GOOGLE BUTTON WITH HANDLER --- */}
        <button 
          onClick={handleGoogleLogin} // <--- Attached function here
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
             <span>Connecting...</span>
          ) : (
            <>
              {/* Google SVG Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-400">Or continue with email</span>
          </div>
        </div>

        {/* Email Form (Static for now) */}
        <form className="space-y-5">
           {/* ... existing inputs ... */}
           <input type="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200" />
           <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200" />
           
           <button type="button" className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg">
             Sign In
           </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-200">
          <p className="text-slate-600">
            Don't have an account? <Link href="/signup" className="text-blue-600 font-bold hover:underline">Sign up here</Link>
          </p>
        </div>
      </div>
    </main>
  );
}