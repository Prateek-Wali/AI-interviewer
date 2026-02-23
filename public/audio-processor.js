// Audio worklet processor for capturing microphone PCM data
// Runs on a SEPARATE AUDIO THREAD (not the main thread)

class AudioCaptureProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this._bufferSize = 2048;
        this._buffer = new Float32Array(this._bufferSize);
        this._bufferIndex = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || !input[0]) return true;

        const channelData = input[0];

        for (let i = 0; i < channelData.length; i++) {
            this._buffer[this._bufferIndex++] = channelData[i];

            if (this._bufferIndex >= this._bufferSize) {
                // Buffer full — send to main thread
                this.port.postMessage({
                    type: 'audio',
                    buffer: this._buffer.slice(),
                });
                this._bufferIndex = 0;
            }
        }

        return true; // Keep processor alive
    }
}

registerProcessor('audio-capture-processor', AudioCaptureProcessor);
