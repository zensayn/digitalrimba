// Encodes decoded PCM to 128 kbps MP3 off the main thread (lamejs is pure JS
// and takes seconds for a full song). Channel buffers arrive transferred, not
// cloned. Posts back the MP3 Blob, or null to signal "upload the original".
import { Mp3Encoder } from "@breezystack/lamejs";

type EncodeRequest = { channels: ArrayBuffer[]; sampleRate: number };

function toInt16(f32: Float32Array): Int16Array {
  const out = new Int16Array(f32.length);
  for (let i = 0; i < f32.length; i++) {
    const s = Math.max(-1, Math.min(1, f32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

self.onmessage = (e: MessageEvent<EncodeRequest>) => {
  try {
    const channels = e.data.channels.map((buf) => new Float32Array(buf));
    // lamejs handles mono/stereo only — extra channels (5.1 etc.) are dropped.
    const left = toInt16(channels[0]);
    const right = channels.length > 1 ? toInt16(channels[1]) : null;
    const encoder = new Mp3Encoder(right ? 2 : 1, e.data.sampleRate, 128);
    const parts: Uint8Array[] = [];
    const BLOCK = 1152; // one MPEG frame of samples
    for (let i = 0; i < left.length; i += BLOCK) {
      const chunk = right
        ? encoder.encodeBuffer(left.subarray(i, i + BLOCK), right.subarray(i, i + BLOCK))
        : encoder.encodeBuffer(left.subarray(i, i + BLOCK));
      if (chunk.length > 0) parts.push(chunk);
    }
    const tail = encoder.flush();
    if (tail.length > 0) parts.push(tail);
    self.postMessage(new Blob(parts as BlobPart[], { type: "audio/mpeg" }));
  } catch {
    self.postMessage(null);
  }
};

export {};
