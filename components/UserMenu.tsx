"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface UserMenuProps {
  email: string;
  avatarUrl?: string; // Optional because email users won't have one
}

export default function UserMenu({ email, avatarUrl }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu if clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get the first letter for the fallback avatar
  const initial = email.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      {/* 1. The Trigger (Avatar) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <span className="hidden md:block text-sm font-medium text-slate-700 mr-2">
          {email}
        </span>
        
        {avatarUrl ? (
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
             <Image 
               src={avatarUrl} 
               alt="Profile" 
               width={40} 
               height={40} 
               className="object-cover"
             />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold border border-blue-700 shadow-sm">
            {initial}
          </div>
        )}
      </button>

      {/* 2. The Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="px-4 py-3 border-b border-slate-100 md:hidden">
            <p className="text-sm font-medium text-slate-900 truncate">{email}</p>
          </div>

          <a href="/dashboard/settings" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            ⚙️ Settings
          </a>
          
          <form action="/auth/signout" method="post">
             <button 
               type="submit"
               className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
             >
               🚪 Sign Out
             </button>
          </form>
        </div>
      )}
    </div>
  );
}