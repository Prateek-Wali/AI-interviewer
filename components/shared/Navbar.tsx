// src/components/Navbar.tsx
import React from 'react';
import Link from 'next/link'; // <--- Next.js Link is essential here

const Navbar = () => {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl flex items-center justify-between px-6 py-3 border border-slate-200 bg-white/70 backdrop-blur-lg rounded-full shadow-sm transition-all duration-300">

      {/* 1. Logo Section */}
      <Link href="/" className="flex items-center gap-2 cursor-pointer group">
        <div className="relative w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-blue-600 to-violet-600 rounded-full shadow-md group-hover:shadow-lg transition-all duration-300">
          <span className="text-white font-bold text-lg font-sans">D</span>
        </div>
        <span className="text-lg font-bold text-slate-800 tracking-tight">
          DevPrep<span className="text-blue-600">AI</span>
        </span>
      </Link>

      {/* 2. Navigation Links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <Link href="/" className="hover:text-blue-600 transition-all duration-300">
          Home
        </Link>
        <Link href="/about" className="hover:text-blue-600 transition-all duration-300">
          About
        </Link>
      </div>

      {/* 3. Call to Action -> Now links to /login */}
      <Link href="/login">
        <button className="px-5 py-2 text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 hover:border-blue-300 transition-all cursor-pointer">
          Login / Sign up
        </button>
      </Link>
      
    </nav>
  );
};

export default Navbar;