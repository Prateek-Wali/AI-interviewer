"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function InterviewSession() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  // --- CAMERA INIT ---
  const initializeMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: "user" }, 
        audio: true 
      });
      setStream(mediaStream);
      setHasPermission(true);
    } catch (err) {
      alert("Camera permission denied. We need it for the simulation.");
    }
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  // --- PERMISSION SCREEN (Pre-Interview) ---
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        {/* Simple Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 -z-10"></div>
        
        <div className="max-w-md w-full">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                <span className="text-2xl text-white">📷</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Let's check your setup</h1>
            <p className="text-slate-500 mb-8">
                DevPrepAI uses your camera to analyze confidence and body language.
            </p>
            <button 
                onClick={initializeMedia}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-black transition-all transform hover:scale-[1.02] shadow-xl"
            >
                Enable Camera & Start
            </button>
        </div>
      </div>
    );
  }

  // --- MAIN INTERVIEW INTERFACE ---
  return (
    <main className="fixed inset-0 bg-[#F8FAFC] flex flex-col items-center justify-center p-6 overflow-hidden">
      
      {/* 1. DYNAMIC ISLAND (AI VISUALIZER) */}
      <div className="absolute top-6 z-50 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-2xl px-6 py-3 rounded-full shadow-sm border border-white/50">
            {/* The "Orb" */}
            <div className="relative flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
            </div>
            
            <span className="text-sm font-semibold text-slate-700 w-32 text-center">
                DevPrepAI Listening...
            </span>

            {/* Timer */}
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <span className="text-sm font-mono text-slate-400">00:45</span>
        </div>
      </div>

      {/* 2. THE STAGE (CENTERED VIDEO) */}
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-[32px] overflow-hidden shadow-2xl border-[8px] border-white group">
        
        {/* The Webcam Feed */}
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-cover scale-x-[-1]"
        />

        {/* Status Overlay (Top Left of Video) */}
        <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
             <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></div>
             <span className="text-xs font-medium text-white/90">Live Feed</span>
        </div>

        {/* Mute Overlay */}
        {isMuted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all">
                <div className="bg-red-500/90 text-white px-6 py-3 rounded-full font-bold flex items-center gap-3 shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>
                    Microphone Off
                </div>
            </div>
        )}
      </div>

      {/* 3. FLOATING CONTROLS (BOTTOM) */}
      <div className="absolute bottom-10 flex items-center gap-4 z-50">
         
         {/* Mute Toggle */}
         <button 
           onClick={() => setIsMuted(!isMuted)}
           className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg hover:-translate-y-1 ${isMuted ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-white text-slate-700 border border-white hover:border-blue-200'}`}
         >
            {isMuted ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"></line></svg>
            ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
            )}
         </button>

         {/* End Call (Pill) */}
         <Link href="/dashboard">
             <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-red-500/30 hover:-translate-y-1 transition-all flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                End Session
             </button>
         </Link>

         {/* Settings / More */}
         <button className="w-14 h-14 bg-white/80 backdrop-blur-md border border-white text-slate-600 rounded-full flex items-center justify-center hover:bg-white shadow-lg hover:-translate-y-1 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
         </button>

      </div>

    </main>
  );
}