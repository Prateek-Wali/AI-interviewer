"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthCodeErrorPage() {
    return (
        <main className="min-h-screen flex items-center justify-center relative p-4 overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 -z-50 h-full w-full bg-white">
                <div className="absolute h-full w-full bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-medium"></div>
            </div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-8 relative z-10 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Authentication Error</h1>
                <p className="text-slate-500 mb-8">
                    Something went wrong during sign in. This can happen if the link
                    expired or was already used. Please try again.
                </p>

                <div className="flex flex-col gap-3">
                    <Link href="/login">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-500/30">
                            Try Logging In
                        </button>
                    </Link>
                    <Link href="/signup">
                        <button className="w-full bg-white hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-lg transition-all border border-slate-200">
                            Create New Account
                        </button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
