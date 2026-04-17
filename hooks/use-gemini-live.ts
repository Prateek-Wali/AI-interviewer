import { useState, useRef, useCallback, useEffect } from 'react';

// Use your working API key
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const WS_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;

interface UseGeminiLiveProps {
    onInterviewEnd?: () => void;
    expectedQuestionCount?: number;
}

export function useGeminiLive({ onInterviewEnd, expectedQuestionCount = 0 }: UseGeminiLiveProps = {}) {
    const [isConnected, setIsConnected] = useState(false);
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

    // Keep callback fresh
    useEffect(() => {
        onInterviewEndRef.current = onInterviewEnd;
    }, [onInterviewEnd]);

    useEffect(() => {
        expectedQuestionCountRef.current = expectedQuestionCount;
    }, [expectedQuestionCount]);

    const finishInterview = useCallback(() => {
        if (hasEndedInterviewRef.current) return;
        hasEndedInterviewRef.current = true;
        shouldEndInterviewRef.current = false;
        onInterviewEndRef.current?.();
    }, []);

    // --- DATABASE HELPERS ---

    // 1. Save Question (We call this when AI finishes speaking)
    const saveQuestionToDB = async (intId: string) => {
        try {
            const res = await fetch(`/api/interviews/${intId}/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionText: "AI Question (Audio)",
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
                answeredQuestionCountRef.current += 1;
                console.log("✅ Answer Saved to DB");
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


    // --- CONNECT ---
    const connect = useCallback((systemInstruction: string, id?: string) => {
        hasEndedInterviewRef.current = false;
        shouldEndInterviewRef.current = false;
        answeredQuestionCountRef.current = 0;
        questionAnsweredRef.current = false;
        currentQuestionIdRef.current = null;
        userTranscriptRef.current = "";

        if (id) {
            setInterviewId(id);
            interviewIdRef.current = id;
        }

        if (!systemInstruction || systemInstruction.trim() === "") {
            console.error("❌ ABORTING: No system instructions.");
            return;
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('✅ WebSocket OPEN');
            setIsConnected(true);

            const setupMsg = {
                setup: {
                    model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
                    system_instruction: { parts: [{ text: systemInstruction }] },
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
                    }
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

                // A. Handle Setup Complete — kick off the AI to speak first
                if (data.setupComplete) {
                    console.log("✅ Gemini session ready, triggering AI to start...");
                    ws.send(JSON.stringify({
                        client_content: {
                            turns: [{ role: "user", parts: [{ text: "Begin the interview." }] }],
                            turn_complete: true
                        }
                    }));
                }

                // B. Handle Audio (Standard)
                if (data.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
                    const audioBase64 = data.serverContent.modelTurn.parts[0].inlineData.data;
                    scheduleAudioChunk(audioBase64);
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
                    // If interview is ending, don't save questions or start listening.
                    // The audio onended callback (or safety timeout) will trigger onInterviewEnd.
                    if (shouldEndInterviewRef.current) {
                        console.log("🛑 Turn complete received — interview ending, skipping question save");
                        // If AI audio already finished, end immediately
                        if (!isSpeakingRef.current) {
                            finishInterview();
                        }
                        return;
                    }

                    // AI finished speaking -> Save a Question Record
                    if (id) {
                        const expectedCount = expectedQuestionCountRef.current;
                        if (expectedCount > 0 && answeredQuestionCountRef.current >= expectedCount) {
                            console.log("🏁 All expected questions answered — ending interview without waiting for another turn");
                            shouldEndInterviewRef.current = true;
                            if (!isSpeakingRef.current) {
                                finishInterview();
                            }
                            return;
                        }

                        // Only create a new question record if the previous one was answered
                        // (If not answered, this is a repeat/clarification — reuse the same question)
                        if (questionAnsweredRef.current || !currentQuestionIdRef.current) {
                            saveQuestionToDB(id);
                            questionAnsweredRef.current = false;
                        } else {
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
                    finishInterview();
                }
            }
        };

        // Safety net: if the interview should end, set a timeout to trigger it
        // in case the onended callback doesn't fire (e.g., audio context issues)
        if (shouldEndInterviewRef.current) {
            const bufferDurationMs = buffer.duration * 1000;
            setTimeout(() => {
                if (shouldEndInterviewRef.current) {
                    console.log("⏰ Safety timeout fired — ending interview");
                    finishInterview();
                }
            }, bufferDurationMs + 2000); // Wait for audio + 2s grace period
        }
    };

    const disconnect = useCallback(() => {
        shouldEndInterviewRef.current = false;
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

    return { connect, disconnect, startRecording, setMuted, isConnected, isSpeaking, volume };
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
