import { useState, useRef, useEffect, useCallback } from 'react';

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
  
  // Audio Scheduling Refs
  const nextStartTimeRef = useRef<number>(0);
  const isPlayingRef = useRef(false);

  // --- CONNECT ---
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket OPEN');
      setIsConnected(true);
      
      const setupMsg = {
        setup: {
          model: "models/gemini-2.0-flash-exp", 
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
                // PLAY IMMEDIATELY (Don't queue in an array, schedule it!)
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

            // Downsample & Send
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

  // --- SMOOTH PLAYBACK (GAPLESS) ---
  const scheduleAudioChunk = (base64Audio: string) => {
    if (!audioContextRef.current) return;

    // 1. Decode Base64 to PCM
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
    const int16Data = new Int16Array(bytes.buffer);

    // 2. Convert Int16 -> Float32
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
        float32Data[i] = int16Data[i] / 32768.0;
    }

    // 3. Create Buffer (Gemini 2.0 Flash output is 24kHz)
    const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);

    // 4. Schedule Gapless Playback
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);

    // Calculate start time:
    // If we are "behind" (stream started a while ago), jump to current time.
    // If we are "ahead" (buffer built up), schedule for the future.
    const currentTime = audioContextRef.current.currentTime;
    
    if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime + 0.05; // Small buffer for safety
    }

    source.start(nextStartTimeRef.current);
    
    // Update next start time
    nextStartTimeRef.current += buffer.duration;

    // Visual State handling
    setIsSpeaking(true);
    source.onended = () => {
        // Only set speaking to false if we have run out of future scheduled audio
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

// --- UTILS (Same as before) ---
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