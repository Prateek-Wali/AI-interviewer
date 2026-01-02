"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGeminiLive } from "../hooks/use-gemini-live"; 

export default function InterviewSession() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState("idle");

  // Use the hook
  const { connect, startRecording, isConnected, isSpeaking, volume } = useGeminiLive();

  // --- CAMERA INIT ---
  const initializeMedia = async () => {
    // 1. CLEAR LOGS
    console.clear();
    console.log("--- STARTING INIT ---");

    try {
      // STEP A: Try to get the camera ONLY
      console.log("1. Requesting Camera...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: "user" }, 
        audio: true 
      });
      
      console.log("✅ Camera Access GRANTED");
      setStream(mediaStream);
      setHasPermission(true); 

    } catch (cameraError) {
      console.error("❌ CAMERA FAILURE:", cameraError);
      alert("Real Camera Error: Check your browser settings or OS permissions.");
      return; // Stop here if camera fails
    }

    try {
      // STEP B: Try to connect to API
      console.log("2. Fetching Persona from API...");
      setStatus("fetching_persona");

      const response = await fetch("/api/interviews/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           type: "TECHNICAL",
           difficulty: "Medium",
           targetDuration: 1800
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ API Success. Persona:", data.systemPrompt);

      // STEP C: Connect Gemini
      console.log("3. Connecting to Gemini...");
      setStatus("connecting_gemini");
      connect(data.systemPrompt);
      startRecording();
      setStatus("active");

    } catch (logicError) {
      console.error("❌ LOGIC/API FAILURE:", logicError);
      alert(`System Error: ${(logicError as Error).message}`);
    }
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // --- PERMISSION SCREEN (Pre-Interview) ---
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
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
    <main className="fixed inset-0 bg-[#F8FAFC] flex flex-col items-center justify-center p-6 overflow-hidden font-sans">
      
      {/* 1. DYNAMIC ISLAND (AI VISUALIZER) */}
      <div className="absolute top-6 z-50 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className={`flex items-center gap-4 bg-white/80 backdrop-blur-2xl px-6 py-3 rounded-full shadow-sm border transition-all duration-300 ${isSpeaking ? 'border-blue-400 shadow-blue-200' : 'border-white/50'}`}>
            
            {/* The "Orb" - Reacts to Speaking State */}
            <div className="relative flex items-center justify-center w-6 h-6">
                {isSpeaking ? (
                    // AI IS TALKING: Big Pulse
                    <>
                       <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-40"></div>
                       <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                    </>
                ) : (
                    // AI IS LISTENING: React to User Volume
                    <div 
                        className="bg-slate-800 rounded-full transition-all duration-75"
                        style={{
                            width: `${Math.max(8, volume * 100)}px`,
                            height: `${Math.max(8, volume * 100)}px`
                        }}
                    ></div>
                )}
            </div>
            
            <span className="text-sm font-semibold text-slate-700 w-40 text-center truncate">
                {isConnected ? (isSpeaking ? "DevPrepAI Speaking..." : "Listening...") : "Connecting..."}
            </span>

            {/* Timer */}
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <span className="text-sm font-mono text-slate-400">Live</span>
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
                    <span>Microphone Off</span>
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
            {isMuted ? "🔇" : "🎙️"}
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
            ⚙️
         </button>

      </div>

    </main>
  );
}