import { useState, useRef, useCallback, useEffect } from 'react';

// Use your working API key
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY; 
const WS_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;

export function useGeminiLive() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  // 1. connect() now REQUIRES a string. No fallbacks.
  const connect = useCallback((systemInstruction: string) => {
    
    // SAFETY CHECK: If the API didn't give us a prompt, STOP.
    if (!systemInstruction || systemInstruction.trim() === "") {
        console.error("❌ ABORTING: No system instructions received from Backend.");
        alert("System Error: The interviewer persona failed to load.");
        return;
    }

    // LOGGING: Prove that the backend prompt reached here
    console.log("🔹 WEBSOCKET CONNECTING...");
    console.log("🔹 SYSTEM PROMPT BEING SENT:", systemInstruction.substring(0, 100) + "..."); 

    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket OPEN');
      setIsConnected(true);
      
      const setupMsg = {
        setup: {
          model: "models/gemini-2.0-flash-exp", 
          
          // 2. INJECT: Use the variable directly. No "||" fallback.
          system_instruction: {
            parts: [{ text: systemInstruction }] 
          },
          
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
            if (data.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
                const audioBase64 = data.serverContent.modelTurn.parts[0].inlineData.data;
                scheduleAudioChunk(audioBase64);
            }
        } catch (e) {
            console.error("JSON Parse Error:", e);
        }
    };
  }, []);

  // --- RECORDING ---
  const startRecording = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        inputSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

        processorRef.current.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Visualizer Volume
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
            setVolume(Math.sqrt(sum / inputData.length));

            // Send Audio
            const downsampled = downsampleTo16k(inputData, audioContextRef.current!.sampleRate);
            const pcmData = floatTo16BitPCM(downsampled);
            const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));

            if (wsRef.current?.readyState === WebSocket.OPEN) {
                const msg = {
                    realtime_input: {
                        media_chunks: [{
                            mime_type: "audio/pcm",
                            data: base64Data
                        }]
                    }
                };
                wsRef.current.send(JSON.stringify(msg));
            }
        };

        inputSourceRef.current.connect(processorRef.current);
        processorRef.current.connect(audioContextRef.current.destination);

    } catch (err) {
        console.error("Mic Error:", err);
    }
  }, []);

  // --- AUDIO PLAYBACK ---
  const scheduleAudioChunk = (base64Audio: string) => {
    if (!audioContextRef.current) return;

    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
    const int16Data = new Int16Array(bytes.buffer);

    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
        float32Data[i] = int16Data[i] / 32768.0;
    }

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
        }
    };
  };

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    inputSourceRef.current?.disconnect();
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    setIsConnected(false);
  }, []);

  return { connect, disconnect, startRecording, isConnected, isSpeaking, volume };
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