"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGeminiLive } from "@/hooks/use-gemini-live";
import { Mic, MicOff } from "lucide-react";

export default function InterviewSession() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState("idle");
  const [expectedQuestionCount, setExpectedQuestionCount] = useState(0);

  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(null);
  const handleEndSessionRef = useRef<(() => void) | null>(null);

  const {
    connect,
    disconnect,
    startRecording,
    setMuted,
    isConnected,
    isReconnecting,
    isSpeaking,
    volume
  } = useGeminiLive({
    expectedQuestionCount,
    onInterviewEnd: useCallback(() => {
      if (handleEndSessionRef.current) handleEndSessionRef.current();
    }, [])
  });

  // Timer state — declared after useGeminiLive so isConnected is available
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Live timer — starts when interview becomes active
  useEffect(() => {
    if (hasPermission && isConnected) {
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [hasPermission, isConnected]);

  const formattedTime = `${Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:${(elapsedSeconds % 60).toString().padStart(2, '0')}`;

  // Track if AI has spoken at least once — used to show waiting overlay
  const [hasAISpoken, setHasAISpoken] = useState(false);
  useEffect(() => {
    if (isSpeaking && !hasAISpoken) setHasAISpoken(true);
  }, [isSpeaking, hasAISpoken]);

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
          type: "BEHAVIORAL",
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
      if (data.resuming) {
        console.log(`🔄 Resuming previous interview at question ${(data.answeredCount ?? 0) + 1}`);
      }

      // Track interview ID for later redirect to report
      setCurrentInterviewId(data.interviewId);
      setExpectedQuestionCount(Array.isArray(data.questions) ? data.questions.length : 0);

      // STEP C: Connect Gemini
      console.log("3. Connecting to Gemini...");
      setStatus("connecting_gemini");
      connect(data.systemPrompt, data.interviewId, {
        bankQuestions: Array.isArray(data.questions) ? data.questions.map((q: { text: string }) => q.text) : [],
        answeredBankIndices: data.answeredBankIndices ?? [],
        pendingQuestionId: data.pendingQuestionId ?? null,
      });
      startRecording();
      setStatus("active");

    } catch (logicError) {
      console.error("❌ LOGIC/API FAILURE:", logicError);
      alert(`System Error: ${(logicError as Error).message}`);
    }
  };

  const handleEndSession = async () => {
    // 1. Cut the connection to stop the AI from talking/listening
    disconnect();

    // 2. Stop the camera/mic tracks physically
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    // 3. Save the end time to the database
    if (currentInterviewId) {
      try {
        await fetch(`/api/interviews/${currentInterviewId}/end`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endedAt: new Date() })
        });
      } catch (e) {
        console.error("Failed to save end time", e);
      }
    }

    // 4. Redirect to report page
    router.push(`/interview/${currentInterviewId}/report`);
  };

  useEffect(() => {
    handleEndSessionRef.current = handleEndSession;
  });

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // --- PERMISSION SCREEN (Pre-Interview) ---
  if (!hasPermission) {
    return (
      <div className="min-h-screen relative font-inter text-[#1f2328] flex items-center justify-center p-4">

        {/* Background — matches dashboard */}
        <div className="fixed inset-0 -z-50 h-full w-full bg-white">
          <div className="absolute h-full w-full bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-medium"></div>
          <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-cyan-50/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-fast"></div>
        </div>

        {/* Card */}
        <div className="w-full max-w-[480px] relative">
          {/* Top accent bar */}
          <div className="h-[2px] rounded-t-lg" style={{ background: 'linear-gradient(90deg, #1a7f37, #0969da)' }}></div>

          <div className="bg-white border border-[#d0d7de] border-t-0 rounded-b-lg px-9 py-10 text-center" style={{ boxShadow: '0 1px 3px rgba(140,149,159,0.15)' }}>

            {/* Lintrvw icon */}
            <div className="w-10 h-10 bg-[#f6f8fa] border border-[#d0d7de] rounded-lg flex items-center justify-center mx-auto mb-5">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="6" width="12" height="2" rx="1" fill="#8c959f" />
                <rect x="4" y="11" width="18" height="2" rx="1" fill="#8c959f" />
                <rect x="4" y="16" width="14" height="2" rx="1" fill="#8c959f" />
                <path d="M4 21 Q5.5 19.5 7 21 Q8.5 22.5 10 21 Q11.5 19.5 13 21 Q14.5 22.5 16 21 Q17.5 19.5 19 21 Q20.5 22.5 22 21"
                  stroke="#cf222e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>

            <h1 className="font-mono font-bold text-xl tracking-tight text-[#1f2328]">Let&apos;s check your setup</h1>
            <p className="text-sm text-[#636c76] text-center mt-1 leading-relaxed mb-7">
              Lintrvw uses your camera to make it feel like a real interview.
            </p>

            <button
              onClick={initializeMedia}
              className="w-full py-2.5 bg-[#1a7f37] border border-[rgba(27,31,36,0.15)] text-white font-mono font-semibold text-sm rounded-md hover:bg-[#1c8139] transition-colors duration-150"
            >
              Enable Camera & Start
            </button>

            {/* Info note */}
            <p className="flex items-center justify-center gap-1.5 font-mono text-xs text-[#8c959f] text-center mt-5">
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Camera data is never recorded.
            </p>

          </div>
        </div>
      </div>
    );
  }

  // --- MAIN INTERVIEW INTERFACE ---
  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden font-inter">

      {/* Background */}
      <div className="fixed inset-0 -z-50 h-full w-full bg-white">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-medium"></div>
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-cyan-50/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-fast"></div>
      </div>

      {/* Reconnecting banner — shown when the Gemini session dropped and is being restored */}
      {isReconnecting && hasAISpoken && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-[#fff8c5] border border-[rgba(154,103,0,0.3)] rounded-md px-4 py-2 shadow-sm">
          <div className="w-3 h-3 border-2 border-[#9a6700]/30 border-t-[#9a6700] rounded-full animate-spin" />
          <span className="font-mono text-xs text-[#9a6700] font-medium">Connection hiccup — restoring your interview...</span>
        </div>
      )}

      {/* Waiting overlay — shown until AI speaks for the first time */}
      {hasPermission && !hasAISpoken && (
        <div className="fixed inset-0 z-50 bg-[#1f2328]/60 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="font-mono text-sm text-white font-medium">Waiting for interviewer to connect...</span>
          </div>
        </div>
      )}

      {/* ═══ TOP STATUS BAR ═══ */}
      <div className="flex items-center gap-8 px-6 py-3 border-b border-[#d0d7de] bg-white/80 backdrop-blur-sm z-10">

        {/* Left — Lintrvw logo + session label */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#f6f8fa] border border-[#d0d7de] rounded-md flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
              <rect x="4" y="6" width="12" height="2" rx="1" fill="#8c959f" />
              <rect x="4" y="11" width="18" height="2" rx="1" fill="#8c959f" />
              <rect x="4" y="16" width="14" height="2" rx="1" fill="#8c959f" />
              <path d="M4 21 Q5.5 19.5 7 21 Q8.5 22.5 10 21 Q11.5 19.5 13 21 Q14.5 22.5 16 21 Q17.5 19.5 19 21 Q20.5 22.5 22 21"
                stroke="#cf222e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-mono font-bold text-sm">
            <span className="text-[#1f2328]">Lint</span><span className="text-[#8c959f]">rvw</span>
          </span>
          <span className="text-[#d0d7de]">|</span>
          <span className="font-mono text-xs text-[#636c76]">Behavioral Interview</span>
        </div>

        {/* Speaking status */}
        <div className="flex items-center gap-2">
          {isReconnecting ? (
            <div className="flex items-center gap-2 bg-[#fff8c5] border border-[rgba(154,103,0,0.3)] rounded-md px-3 py-1.5">
              <div className="w-3 h-3 border-2 border-[#9a6700]/30 border-t-[#9a6700] rounded-full animate-spin" />
              <span className="font-mono text-xs text-[#9a6700] font-medium">Reconnecting...</span>
            </div>
          ) : isSpeaking ? (
            <div className="flex items-center gap-2 bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-3 py-1.5">
              <div className="flex items-center gap-[3px] h-4">
                {[0.4, 0.7, 1, 0.7, 0.4].map((scale, i) => (
                  <div
                    key={i}
                    className="w-[3px] bg-[#0969da] rounded-full animate-pulse"
                    style={{
                      height: `${scale * 16}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.8s'
                    }}
                  />
                ))}
              </div>
              <span className="font-mono text-xs text-[#0969da] font-medium">Alex speaking</span>
            </div>
          ) : (isConnected && hasAISpoken) ? (
            <div className="flex items-center gap-2 bg-[#dafbe1] border border-[rgba(26,127,55,0.3)] rounded-md px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-[#1a7f37] animate-pulse" />
              <span className="font-mono text-xs text-[#1a7f37] font-medium">Listening...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-[#8c959f]" />
              <span className="font-mono text-xs text-[#8c959f]">Connecting...</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══ MAIN CONTENT — Two-panel grid ═══ */}
      <div className="grid grid-cols-3 gap-5 flex-1 max-w-6xl w-full mx-auto px-6 py-5 pb-24 min-h-0">

        {/* Camera — 2 columns */}
        <div className={`col-span-2 relative bg-[#0d1117] border rounded-lg overflow-hidden transition-shadow duration-300 ${isSpeaking ? 'shadow-[0_0_0_2px_#0969da] border-[#0969da]' : volume > 0.02 ? 'shadow-[0_0_0_2px_#1a7f37] border-[#1a7f37]' : 'border-[#d0d7de]'
          }`}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />

          {/* Live Feed badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md" style={{ background: 'rgba(13,17,23,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_6px_#22c55e]"></div>
            <span className="font-mono text-xs font-medium text-white">Live Feed</span>
          </div>

          {/* Mute Overlay */}
          {isMuted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="flex items-center gap-2 bg-[#cf222e] text-white px-5 py-2.5 rounded-md font-mono font-semibold text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                Microphone Off
              </div>
            </div>
          )}
        </div>

        {/* Right Panel — 1 column */}
        <div className="col-span-1 flex flex-col gap-4 min-h-0">

          {/* Alex Avatar Card */}
          <div className="bg-white border border-[#d0d7de] rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0d1117] border border-[#30363d] flex items-center justify-center flex-shrink-0">
              <span className="font-mono font-bold text-sm text-white">A</span>
            </div>
            <div>
              <div className="font-mono font-semibold text-sm text-[#1f2328]">Alex</div>
              <div className="font-mono text-xs text-[#8c959f]">Senior Engineer · Interviewer</div>
            </div>
            <div className={`ml-auto w-2.5 h-2.5 rounded-full transition-colors ${isSpeaking ? 'bg-[#0969da] animate-pulse' : 'bg-[#eaeef2]'}`} />
          </div>

          {/* Question Progress Card */}
          <div className="bg-white border border-[#d0d7de] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#636c76]">Progress</span>
              <span className="font-mono text-xs text-[#8c959f]">Interview in progress</span>
            </div>
            <div className="h-1.5 bg-[#eaeef2] rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-[#1a7f37] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (elapsedSeconds / 1800) * 100)}%` }}
              />
            </div>
            <div className="flex gap-2">
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-[#d0d7de] bg-[#f6f8fa] text-[#636c76]">
                3 Behavioral
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-[#d0d7de] bg-[#f6f8fa] text-[#636c76]">
                5 Resume-based
              </span>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-white border border-[#d0d7de] rounded-lg p-4 flex-1 min-h-0">
            <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[#636c76] mb-3">
              Quick Tips
            </div>
            <div className="space-y-3">
              {[
                { icon: '🎯', tip: 'Use the STAR method for behavioral questions' },
                { icon: '⏱️', tip: 'Take a moment to think before answering' },
                { icon: '📢', tip: 'Speak clearly — Alex adapts to your pace' },
                { icon: '💡', tip: 'Be specific with examples from your experience' },
              ].map((item, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <span className="text-xs mt-0.5">{item.icon}</span>
                  <span className="font-mono text-[11px] text-[#636c76] leading-relaxed">{item.tip}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ═══ BOTTOM CONTROL BAR ═══ */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-[#d0d7de] px-6 py-3.5 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-center">

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Mic toggle */}
            <button
              onClick={() => {
                const newMuted = !isMuted;
                setIsMuted(newMuted);
                setMuted(newMuted);
              }}
              className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${isMuted
                ? 'bg-[#fff8f8] border-[rgba(207,34,46,0.3)] text-[#cf222e]'
                : 'bg-white border-[#d0d7de] text-[#1f2328] hover:bg-[#f6f8fa]'
                }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* End Session */}
            <button
              onClick={handleEndSession}
              className="flex items-center gap-2 bg-[#cf222e] hover:bg-[#a40e26] text-white font-mono font-semibold text-sm px-5 py-2.5 rounded-md border border-[rgba(207,34,46,0.4)] transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              End Session
            </button>
          </div>

        </div>
      </div>

    </main>
  );
}
