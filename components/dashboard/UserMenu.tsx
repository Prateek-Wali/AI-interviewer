"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Settings, LogOut } from 'lucide-react';

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
          <div 
            className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold shadow-sm"
            style={{ background: 'linear-gradient(135deg, #1a7f37, #0969da)' }}
          >
            {initial}
          </div>
        )}
      </button>

      {/* 2. The Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 z-50 animate-in fade-in zoom-in-95 duration-200 bg-white border border-[#d0d7de] rounded-lg p-1 min-w-[180px]"
          style={{ boxShadow: '0 8px 24px rgba(140,149,159,0.2)' }}
        >
          
          <div className="text-[12px] text-[#636c76] px-3 py-2 border-b border-[#eaeef2] mb-1">
            <p className="font-medium truncate">{email}</p>
          </div>

          <a href="/dashboard/settings" className="flex items-center gap-2 text-[13px] px-3 py-1.5 rounded-md text-[#1f2328] hover:bg-[#f6f8fa] transition-colors">
            <Settings className="w-4 h-4 text-[#8c959f]" />
            Settings
          </a>
          
          <form action="/auth/signout" method="post" className="mt-1">
             <button 
               type="submit"
               className="w-full text-left flex items-center gap-2 text-[13px] px-3 py-1.5 rounded-md text-[#cf222e] hover:bg-[#fff8f8] transition-colors"
             >
               <LogOut className="w-4 h-4" />
               Sign Out
             </button>
          </form>
        </div>
      )}
    </div>
  );
}