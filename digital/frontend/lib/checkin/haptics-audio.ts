// Scan feedback cues. Feature-detected: vibrate is Android-only, and
// AudioContext needs a prior user gesture (PIN submit provides one).

let audioCtx: AudioContext | null = null;

function beep(freq: number, durationMs: number) {
  try {
    audioCtx ??= new AudioContext();
    if (audioCtx.state === "suspended") void audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + durationMs / 1000
    );
    osc.start();
    osc.stop(audioCtx.currentTime + durationMs / 1000);
  } catch {
    // no audio available — silent kiosk is fine
  }
}

/** Create/resume the AudioContext from a user gesture (PIN submit) so
 * later scan beeps aren't blocked by autoplay policy. */
export function primeAudio() {
  try {
    audioCtx ??= new AudioContext();
    if (audioCtx.state === "suspended") void audioCtx.resume();
  } catch {}
}

/** Short high beep + single buzz: guest found / checked in. */
export function successFeedback() {
  navigator.vibrate?.(80);
  beep(880, 120);
}

/** Low double buzz: duplicate scan or error — operator must look at screen. */
export function warningFeedback() {
  navigator.vibrate?.([60, 40, 60]);
  beep(220, 200);
}
