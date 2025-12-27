"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicNavbar() {
  const pathname = usePathname();

  // Hide on dashboard
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    // PILL CONTAINER: Fixed position, centered, rounded-full
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg rounded-full px-6 py-3 flex items-center justify-between">
      
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl">⚡</span>
        <span className="font-bold text-xl text-slate-900">DevPrepAI</span>
      </Link>

      {/* Center Links (Desktop only) */}
      <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <Link href="/about" className="hover:text-blue-600 transition-colors">About</Link>
      </div>

      {/* Right Action Button */}
      <div className="flex gap-4">
        <Link href="/login">
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-md shadow-blue-500/20">
            Login / Sign Up
          </button>
        </Link>
      </div>

    </nav>
  );
}