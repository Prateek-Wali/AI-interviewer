import { useState, useRef, useCallback, useEffect } from 'react';
import { matchBankQuestion } from '@/lib/question-matching';

// Use your working API key
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const WS_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;

// Gemini Live kills the WS at ~10 min regardless of turn state, so recovery
// must be re-entrant: a long interview can go through several reconnects
const MAX_RECONNECT_ATTEMPTS = 5;

// Sent as the kickoff turn when resuming with a native session handle —
// the server restores conversation state, we just nudge the AI to continue
const RECONNECT_NUDGE = "(SYSTEM NOTE: The audio connection dropped briefly and has just been restored. Continue the interview exactly where you left off. If you were in the middle of asking a question, ask that question again in full. Do NOT re-introduce yourself, do NOT restart the interview, and do NOT mention this note.)";

interface UseGeminiLiveProps {
    onInterviewEnd?: () => void;
    expectedQuestionCount?: number;
}

interface ConnectOptions {
    // Bank question texts — used to tell real questions apart from
    // quality-gate follow-ups when tracking progress
    bankQuestions?: string[];
    // Set when resuming a previous session (e.g. after page refresh):
    // indices of bank questions that already have answers
    answeredBankIndices?: number[];
    pendingQuestionId?: string | null;
}

interface OpenSocketOptions {
    systemInstruction: string;
    resumeHandle: string | null;
    kickoffText: string | null;
}

export function useGeminiLive({ onInterviewEnd, expectedQuestionCount = 0 }: UseGeminiLiveProps = {}) {
    const [isConnected, setIsConnected] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [volume, setVolume] = useState(0);

    // --- Tracking IDs & Transcripts ---
    const [interviewId, setInterviewId] = useState<string | null>(null);
    const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
    const userTranscriptRef = useRef<string>("");
    const responseStartTimeRef = useRef<number>(0);

    // Ref mirrors for values accessed inside WebSocket callbacks (avoids stale closures)
    const interviewIdRef = useRef<string | null>(null);
    const currentQuestionIdRef = useRef<string | null>(null);
    const questionAnsweredRef = useRef<boolean>(false);

    // Refs
    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const recognitionRef = useRef<any>(null);
    const isSpeakingRef = useRef<boolean>(false); // Track AI speaking state for audio gating
    const isMutedRef = useRef<boolean>(false);     // Track user mute state
    const volumeThrottleRef = useRef<number>(0);   // Throttle volume updates
    const micStreamRef = useRef<MediaStream | null>(null);
    const shouldEndInterviewRef = useRef<boolean>(false);
    const hasEndedInterviewRef = useRef<boolean>(false);
    const answeredQuestionCountRef = useRef<number>(0);
    const expectedQuestionCountRef = useRef<number>(expectedQuestionCount);
    const onInterviewEndRef = useRef(onInterviewEnd);

    // --- Bank-question progress tracking ---
    // Progress counts bank questions completed, NOT answered rows: the AI's
    // quality-gate follow-ups also create rows, and counting those made the
    // auto-end fire after 3 real questions (8 rows) in a 6-minute interview
    const bankQuestionsRef = useRef<string[]>([]);
    const answeredBankIndicesRef = useRef<Set<number>>(new Set());
    const pendingBankIndexRef = useRef<number>(-1); // bank index of the question awaiting an answer, -1 = follow-up

    // --- Session recovery refs ---
    const systemInstructionRef = useRef<string>("");
    const resumeHandleRef = useRef<string | null>(null);   // Gemini native session resumption token
    const intentionalCloseRef = useRef<boolean>(false);    // Set only by disconnect()
    const reconnectAttemptsRef = useRef<number>(0);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const outputTranscriptRef = useRef<string>("");        // AI speech transcription for the current turn

    // Keep callback fresh
    useEffect(() => {
        onInterviewEndRef.current = onInterviewEnd;
    }, [onInterviewEnd]);

    useEffect(() => {
        expectedQuestionCountRef.current = expectedQuestionCount;
    }, [expectedQuestionCount]);

    const finishInterview = useCallback((reason: string) => {
        if (hasEndedInterviewRef.current) return;
        console.log(`🏁 Ending interview — reason: ${reason}`);
        hasEndedInterviewRef.current = true;
        shouldEndInterviewRef.current = false;
        onInterviewEndRef.current?.();
    }, []);

    // --- DATABASE HELPERS ---

    // 1. Save Question (We call this when AI finishes speaking)
    const saveQuestionToDB = async (intId: string, questionText: string) => {
        try {
            const res = await fetch(`/api/interviews/${intId}/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionText,
                    questionType: "Technical"
                })
            });
            const data = await res.json();
            if (data.questionId) {
                setCurrentQuestionId(data.questionId);
                currentQuestionIdRef.current = data.questionId;
                console.log("✅ Question Record Created:", data.questionId);
            }
        } catch (err) {
            console.error("❌ Failed to init question:", err);
        }
    };

    // 2. Save Answer (We call this when User stops speaking)
    const saveAnswerToDB = async (qId: string, text: string) => {
        const intId = interviewIdRef.current;
        if (!intId || !text.trim()) return;

        const duration = (Date.now() - responseStartTimeRef.current) / 1000;
        console.log("💾 Saving Answer:", text);

        try {
            const res = await fetch(`/api/interviews/${intId}/questions/${qId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userResponse: text,
                    responseDuration: Math.floor(duration),
                    fillerWordCount: (text.match(/\b(um|uh|like)\b/gi) || []).length,
                    confidenceScore: 85
                })
            });
            const result = await res.json();
            if (result.smallTalk) {
                console.log("💬 Server classified as small talk, question record deleted");
                // Reset so next turnComplete creates a fresh question
                currentQuestionIdRef.current = null;
                setCurrentQuestionId(null);
            } else if (result.skipped) {
                console.log("🔁 Server classified as meta-request, question stays unanswered");
                // Don't mark as answered — next turnComplete will reuse the same question
            } else {
                questionAnsweredRef.current = true;
                const bankIdx = pendingBankIndexRef.current;
                if (bankIdx >= 0) {
                    answeredBankIndicesRef.current.add(bankIdx);
                    answeredQuestionCountRef.current = answeredBankIndicesRef.current.size;
                    console.log(`✅ Answer Saved to DB (bank question ${bankIdx + 1} — progress ${answeredQuestionCountRef.current}/${expectedQuestionCountRef.current})`);
                } else {
                    console.log("✅ Answer Saved to DB (follow-up question — not counted toward progress)");
                }
            }
        } catch (err) {
            console.error("❌ Failed to save answer:", err);
        }
    };

    // --- SPEECH RECOGNITION (Browser Native) ---
    const startSpeechRecognition = () => {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        if (recognitionRef.current) recognitionRef.current.abort();

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                userTranscriptRef.current += " " + finalTranscript;
            }
        };
        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopSpeechRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            // If we captured text, save it now
            const qId = currentQuestionIdRef.current;
            if (qId && userTranscriptRef.current.trim()) {
                saveAnswerToDB(qId, userTranscriptRef.current);
                userTranscriptRef.current = "";
            }
        }
    };

    // --- WEBSOCKET LIFECYCLE ---
    // openSocket / attemptReconnect are mutually recursive (hoisted function
    // declarations). Everything they touch lives in refs, so the closures
    // from the first render stay valid across re-renders.

    function openSocket(opts: OpenSocketOptions) {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;
        let sawSetupComplete = false;

        ws.onopen = () => {
            console.log(opts.resumeHandle ? '✅ WebSocket OPEN (resuming session)' : '✅ WebSocket OPEN');
            setIsConnected(true);

            const setupMsg = {
                setup: {
                    model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
                    system_instruction: { parts: [{ text: opts.systemInstruction }] },
                    tools: [{
                        function_declarations: [{
                            name: "end_interview",
                            description: "Call this function to end the interview session AFTER you have said the wrap up message to the user."
                        }]
                    }],
                    generation_config: {
                        response_modalities: ["AUDIO"],
                        speech_config: {
                            voice_config: { prebuilt_voice_config: { voice_name: "Puck" } }
                        }
                    },
                    // Capture the AI's spoken words so real question text reaches the DB
                    output_audio_transcription: {},
                    // Lifts the 15-min audio session cap
                    context_window_compression: { sliding_window: {} },
                    // Enables resumption tokens; passing a handle restores the prior session
                    session_resumption: opts.resumeHandle ? { handle: opts.resumeHandle } : {}
                }
            };

            ws.send(JSON.stringify(setupMsg));
        };

        ws.onmessage = async (event) => {
            let textData = "";
            if (event.data instanceof Blob) {
                textData = await event.data.text();
            } else {
                textData = event.data;
            }

            try {
                const data = JSON.parse(textData);

                // A. Handle Setup Complete — kick off / resume the conversation
                if (data.setupComplete) {
                    console.log("✅ Gemini session ready");
                    sawSetupComplete = true;
                    reconnectAttemptsRef.current = 0;
                    setIsReconnecting(false);

                    if (opts.kickoffText) {
                        ws.send(JSON.stringify({
                            client_content: {
                                turns: [{ role: "user", parts: [{ text: opts.kickoffText }] }],
                                turn_complete: true
                            }
                        }));
                    }
                }

                // Store the latest resumption token — used to restore the
                // session when Gemini drops the connection (~10 min cap)
                if (data.sessionResumptionUpdate) {
                    const update = data.sessionResumptionUpdate;
                    if (update.resumable && update.newHandle) {
                        resumeHandleRef.current = update.newHandle;
                    }
                }

                // Server announced it will close the connection soon —
                // reconnect proactively instead of waiting for the hard kill
                if (data.goAway) {
                    console.warn("⚠️ Gemini sent goAway (timeLeft:", data.goAway.timeLeft, ") — reconnecting proactively");
                    ws.close(); // unintentional close → onclose drives the resume
                    return;
                }

                // B. Handle Audio (Standard)
                if (data.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
                    const audioBase64 = data.serverContent.modelTurn.parts[0].inlineData.data;
                    scheduleAudioChunk(audioBase64);
                }

                // Accumulate the AI's speech transcription for this turn
                if (data.serverContent?.outputTranscription?.text) {
                    outputTranscriptRef.current += data.serverContent.outputTranscription.text;
                }

                // C. Handle Function Call
                const parts = data.serverContent?.modelTurn?.parts;
                if (parts) {
                    for (const part of parts) {
                        if (part.functionCall && part.functionCall.name === "end_interview") {
                            console.log("🛑 AI requested to end the interview via tool call");
                            shouldEndInterviewRef.current = true;

                            // Send function response to acknowledge the tool call
                            // so Gemini completes the turn cleanly
                            if (ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({
                                    tool_response: {
                                        function_responses: [{
                                            id: part.functionCall.id || "end_interview",
                                            name: "end_interview",
                                            response: { result: { success: true } }
                                        }]
                                    }
                                }));
                            }
                        }
                    }
                }

                // D. Handle Turn Complete
                if (data.serverContent?.turnComplete) {
                    const aiTurnText = outputTranscriptRef.current.trim();
                    outputTranscriptRef.current = "";

                    // If interview is ending, don't save questions or start listening.
                    // The audio onended callback (or safety timeout) will trigger onInterviewEnd.
                    if (shouldEndInterviewRef.current) {
                        console.log("🛑 Turn complete received — interview ending, skipping question save");
                        // If AI audio already finished, end immediately
                        if (!isSpeakingRef.current) {
                            finishInterview("wrap-up turn complete and audio already finished");
                        }
                        return;
                    }

                    // AI finished speaking -> Save a Question Record
                    const intId = interviewIdRef.current;
                    if (intId) {
                        const expectedCount = expectedQuestionCountRef.current;
                        if (expectedCount > 0 && answeredQuestionCountRef.current >= expectedCount) {
                            console.log("🏁 All expected questions answered — ending interview without waiting for another turn");
                            shouldEndInterviewRef.current = true;
                            if (!isSpeakingRef.current) {
                                finishInterview(`all ${expectedCount} bank questions answered (safety net — AI didn't call end_interview)`);
                            }
                            return;
                        }

                        // Which bank question (if any) is this turn asking?
                        const matchIdx = matchBankQuestion(aiTurnText, bankQuestionsRef.current);

                        // Only create a new question record if the previous one was answered
                        // (If not answered, this is a repeat/clarification — reuse the same question)
                        if (questionAnsweredRef.current || !currentQuestionIdRef.current) {
                            pendingBankIndexRef.current = matchIdx;
                            console.log(matchIdx >= 0
                                ? `🎯 AI asked bank question ${matchIdx + 1}`
                                : "🎯 AI turn didn't match a bank question (intro/follow-up — won't count toward progress)");
                            saveQuestionToDB(intId, aiTurnText || "AI Question (Audio)");
                            questionAnsweredRef.current = false;
                        } else {
                            // Re-ask/clarification of the pending question: keep its bank
                            // index unless this turn clearly moved to a bank question
                            if (matchIdx >= 0) pendingBankIndexRef.current = matchIdx;
                            console.log("🔁 Reusing current question (previous unanswered — likely a repeat/clarification)");
                        }
                        // Start listening to user
                        responseStartTimeRef.current = Date.now();
                        startSpeechRecognition();
                    }
                }

            } catch (e) {
                console.error("JSON Parse Error:", e);
            }
        };

        ws.onerror = (err) => {
            console.error("❌ WebSocket error:", err);
        };

        ws.onclose = (event) => {
            if (wsRef.current !== ws) return; // superseded by a newer socket
            setIsConnected(false);

            if (intentionalCloseRef.current || hasEndedInterviewRef.current) return;

            // Interview was already wrapping up — finish instead of reconnecting
            if (shouldEndInterviewRef.current) {
                finishInterview("socket closed while interview was wrapping up");
                return;
            }

            console.warn(`⚠️ WebSocket closed unexpectedly (code ${event.code}) — attempting recovery`);

            // A close before setupComplete on a handle-resume means the handle
            // was rejected (expired/invalid) — fall back to the DB snapshot
            if (!sawSetupComplete && opts.resumeHandle) {
                console.warn("⚠️ Resume handle rejected — falling back to DB snapshot resume");
                resumeHandleRef.current = null;
            }

            // Discard any in-flight answer: it never reached Gemini, and saving
            // a partial answer would advance the cursor and skip a question.
            // The AI re-asks the in-flight question after resume.
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch { /* already stopped */ }
            }
            userTranscriptRef.current = "";
            isSpeakingRef.current = false;

            attemptReconnect();
        };
    }

    function attemptReconnect() {
        if (intentionalCloseRef.current || hasEndedInterviewRef.current) return;

        if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
            setIsReconnecting(false);
            finishInterview(`connection recovery failed after ${MAX_RECONNECT_ATTEMPTS} attempts — ending with progress saved so far`);
            return;
        }

        reconnectAttemptsRef.current += 1;
        setIsReconnecting(true);
        const delay = Math.min(1000 * 2 ** (reconnectAttemptsRef.current - 1), 8000);

        reconnectTimerRef.current = setTimeout(async () => {
            // Primary: Gemini's native session resumption — server restores the
            // full conversation, no context re-injection needed
            const handle = resumeHandleRef.current;
            if (handle) {
                console.log(`🔄 Reconnecting with Gemini session handle (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
                openSocket({
                    systemInstruction: systemInstructionRef.current,
                    resumeHandle: handle,
                    kickoffText: RECONNECT_NUDGE
                });
                return;
            }

            // Fallback: rebuild context from the DB snapshot
            const intId = interviewIdRef.current;
            if (!intId) {
                finishInterview("no interview id available during connection recovery");
                return;
            }
            try {
                console.log(`🔄 Reconnecting via DB snapshot (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
                const res = await fetch(`/api/interviews/${intId}/resume`);
                if (!res.ok) throw new Error(`Resume endpoint returned ${res.status}`);
                const data = await res.json();

                systemInstructionRef.current = data.resumePrompt;
                answeredBankIndicesRef.current = new Set<number>(data.answeredBankIndices ?? []);
                answeredQuestionCountRef.current = answeredBankIndicesRef.current.size;
                pendingBankIndexRef.current = -1;
                questionAnsweredRef.current = false;
                if (data.pendingQuestionId) {
                    currentQuestionIdRef.current = data.pendingQuestionId;
                    setCurrentQuestionId(data.pendingQuestionId);
                }
                userTranscriptRef.current = "";

                openSocket({
                    systemInstruction: data.resumePrompt,
                    resumeHandle: null,
                    kickoffText: "Resume the interview now."
                });
            } catch (err) {
                console.error("❌ Snapshot resume failed:", err);
                attemptReconnect();
            }
        }, delay);
    }

    // --- CONNECT ---
    const connect = useCallback((systemInstruction: string, id?: string, options?: ConnectOptions) => {
        hasEndedInterviewRef.current = false;
        shouldEndInterviewRef.current = false;
        intentionalCloseRef.current = false;
        reconnectAttemptsRef.current = 0;
        resumeHandleRef.current = null;
        outputTranscriptRef.current = "";
        bankQuestionsRef.current = options?.bankQuestions ?? [];
        answeredBankIndicesRef.current = new Set<number>(options?.answeredBankIndices ?? []);
        answeredQuestionCountRef.current = answeredBankIndicesRef.current.size;
        pendingBankIndexRef.current = -1;
        questionAnsweredRef.current = false;
        currentQuestionIdRef.current = options?.pendingQuestionId ?? null;
        setCurrentQuestionId(options?.pendingQuestionId ?? null);
        userTranscriptRef.current = "";
        systemInstructionRef.current = systemInstruction;

        if (id) {
            setInterviewId(id);
            interviewIdRef.current = id;
        }

        if (!systemInstruction || systemInstruction.trim() === "") {
            console.error("❌ ABORTING: No system instructions.");
            return;
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const isResume = answeredBankIndicesRef.current.size > 0;
        openSocket({
            systemInstruction,
            resumeHandle: null,
            kickoffText: isResume ? "Resume the interview now." : "Begin the interview."
        });
    }, []);


    // --- RECORDING (Optimized with AudioWorkletNode) ---
    const startRecording = useCallback(async () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = stream;
            inputSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

            // ✅ FIX 1: Use AudioWorkletNode instead of deprecated ScriptProcessorNode
            try {
                await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');
                const workletNode = new AudioWorkletNode(audioContextRef.current, 'audio-capture-processor');
                workletNodeRef.current = workletNode;

                workletNode.port.onmessage = (event) => {
                    if (event.data.type === 'audio') {
                        handleAudioData(event.data.buffer);
                    }
                };

                inputSourceRef.current.connect(workletNode);
                workletNode.connect(audioContextRef.current.destination);
                console.log("✅ AudioWorkletNode connected (off main thread)");
            } catch (workletError) {
                // Fallback to ScriptProcessorNode if AudioWorklet not supported
                console.warn("⚠️ AudioWorklet not supported, falling back to ScriptProcessor", workletError);
                const processor = audioContextRef.current.createScriptProcessor(2048, 1, 1);

                processor.onaudioprocess = (e) => {
                    handleAudioData(e.inputBuffer.getChannelData(0));
                };

                inputSourceRef.current.connect(processor);
                processor.connect(audioContextRef.current.destination);
            }
        } catch (err) {
            console.error("Mic Error:", err);
        }
    }, []);

    // Shared audio handling (used by both Worklet and fallback)
    const handleAudioData = (inputData: Float32Array) => {
        // ✅ FIX 3: Throttle volume updates to ~3fps instead of every frame
        const now = Date.now();
        if (now - volumeThrottleRef.current > 300) {
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
            setVolume(Math.sqrt(sum / inputData.length));
            volumeThrottleRef.current = now;
        }

        // ✅ FIX 4: Don't send audio while AI is speaking or user is muted
        if (isSpeakingRef.current || isMutedRef.current) return;

        const downsampled = downsampleTo16k(inputData, audioContextRef.current?.sampleRate || 48000);
        const pcmData = floatTo16BitPCM(downsampled);
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const msg = {
                realtime_input: {
                    media_chunks: [{ mime_type: "audio/pcm", data: base64Data }]
                }
            };
            wsRef.current.send(JSON.stringify(msg));
        }
    };

    // --- PLAYBACK (With Interruption Logic) ---
    const scheduleAudioChunk = (base64Audio: string) => {
        // If AI starts talking, User is done. Stop listening and save answer.
        if (recognitionRef.current) {
            stopSpeechRecognition();
        }

        // ✅ FIX 4: Mark AI as speaking (gate mic audio)
        isSpeakingRef.current = true;

        if (!audioContextRef.current) return;
        const binaryString = window.atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
        const int16Data = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(int16Data.length);
        for (let i = 0; i < int16Data.length; i++) float32Data[i] = int16Data[i] / 32768.0;

        const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
        buffer.getChannelData(0).set(float32Data);

        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);

        const currentTime = audioContextRef.current.currentTime;
        if (nextStartTimeRef.current < currentTime) {
            nextStartTimeRef.current = currentTime + 0.05;
        }

        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += buffer.duration;

        setIsSpeaking(true);
        source.onended = () => {
            if (audioContextRef.current && audioContextRef.current.currentTime >= nextStartTimeRef.current - 0.1) {
                setIsSpeaking(false);
                // ✅ FIX 4: Ungate mic when AI finishes speaking
                isSpeakingRef.current = false;

                // End interview if a disconnect was requested
                if (shouldEndInterviewRef.current) {
                    finishInterview("wrap-up audio finished playing");
                }
            }
        };

        // Safety net: if the interview should end, set a timeout to trigger it
        // in case the onended callback doesn't fire (e.g., audio context issues)
        if (shouldEndInterviewRef.current) {
            const bufferDurationMs = buffer.duration * 1000;
            setTimeout(() => {
                if (shouldEndInterviewRef.current) {
                    finishInterview("wrap-up safety timeout (audio onended never fired)");
                }
            }, bufferDurationMs + 2000); // Wait for audio + 2s grace period
        }
    };

    const disconnect = useCallback(() => {
        intentionalCloseRef.current = true;
        shouldEndInterviewRef.current = false;
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
        setIsReconnecting(false);
        wsRef.current?.close();
        inputSourceRef.current?.disconnect();
        workletNodeRef.current?.disconnect();
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(t => t.stop());
        }
        audioContextRef.current?.close();
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsConnected(false);
    }, []);

    const setMuted = useCallback((muted: boolean) => {
        isMutedRef.current = muted;
        // Also mute/unmute the actual mic tracks so the browser shows the correct state
        if (micStreamRef.current) {
            micStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !muted;
            });
        }
    }, []);

    return { connect, disconnect, startRecording, setMuted, isConnected, isReconnecting, isSpeaking, volume };
}

// --- UTILS ---
function downsampleTo16k(samples: Float32Array, sampleRate: number): Float32Array {
    if (sampleRate === 16000) return samples;
    const ratio = sampleRate / 16000;
    const newLength = Math.round(samples.length / ratio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetSource = 0;
    while (offsetResult < newLength) {
        const nextOffsetSource = Math.round((offsetResult + 1) * ratio);
        let accum = 0, count = 0;
        for (let i = offsetSource; i < nextOffsetSource && i < samples.length; i++) {
            accum += samples[i]; count++;
        }
        result[offsetResult] = count > 0 ? accum / count : 0;
        offsetResult++; offsetSource = nextOffsetSource;
    }
    return result;
}

function floatTo16BitPCM(input: Float32Array) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
}
