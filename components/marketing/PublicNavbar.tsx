"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function LintrvwLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* Icon Mark — light version */}
      <div className="w-8 h-8 bg-[#f6f8fa] border border-[#d0d7de] rounded-lg flex items-center justify-center flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="6" width="12" height="2" rx="1" fill="#8c959f" />
          <rect x="4" y="11" width="18" height="2" rx="1" fill="#8c959f" />
          <rect x="4" y="16" width="14" height="2" rx="1" fill="#8c959f" />
          <path
            d="M4 21 Q5.5 19.5 7 21 Q8.5 22.5 10 21 Q11.5 19.5 13 21 Q14.5 22.5 16 21 Q17.5 19.5 19 21 Q20.5 22.5 22 21"
            stroke="#cf222e" strokeWidth="1.5" fill="none" strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Wordmark — light version */}
      <div className="flex items-baseline font-mono font-extrabold text-xl tracking-tight leading-none">
        <span className="relative text-[#1f2328]">
          Lint
          <svg
            className="absolute -bottom-1 left-0 w-full"
            height="4" viewBox="0 0 40 4"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 3 Q5 0 10 3 Q15 6 20 3 Q25 0 30 3 Q35 6 40 3"
              stroke="#cf222e" strokeWidth="1.5" fill="none" strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="text-[#8c959f]">rvw</span>
      </div>
    </div>
  );
}

export default function PublicNavbar() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/interview")) {
    return null;
  }

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl bg-white/50 backdrop-blur-md border border-slate-200 shadow-lg rounded-full px-6 py-3 flex items-center justify-between">

      {/* Logo */}
      <Link href="/">
        <LintrvwLogo />
      </Link>

      {/* Center Links */}
      <div className="hidden md:flex gap-8 text-sm font-medium text-gh-muted tracking-normal">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
      </div>

      {/* CTA */}
      <div className="flex gap-4">
        <Link href="/login">
          <button className="border border-gh-border text-gh-text-light hover:bg-slate-50 text-sm font-medium px-4 py-2 rounded-md transition-all">
            Login / Sign Up
          </button>
        </Link>
      </div>

    </nav>
  );
}