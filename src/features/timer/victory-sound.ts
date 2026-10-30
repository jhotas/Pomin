/**
 * A short 8-bit fanfare for a finished round of pomodoros, played on square
 * and triangle waves through Web Audio, so there is no sound file to load.
 */

let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();
  return context;
}

/**
 * Browsers only let a page make sound after the person has interacted with
 * it. Call this from a click or a key press, such as starting the timer, so
 * the fanfare can play when the round ends later.
 */
export function unlockAudio() {
  audio();
}

/** [frequency in Hz, start in seconds, length in seconds] */
type Note = [number, number, number];

// An original rising jingle: a quick arpeggio, a bounce, and a held top note.
const MELODY: Note[] = [
  [523.25, 0.0, 0.09], // C5
  [659.25, 0.09, 0.09], // E5
  [783.99, 0.18, 0.09], // G5
  [1046.5, 0.27, 0.18], // C6
  [880.0, 0.48, 0.09], // A5
  [987.77, 0.57, 0.09], // B5
  [1046.5, 0.66, 0.09], // C6
  [1318.51, 0.78, 0.55], // E6
];

const BASS: Note[] = [
  [130.81, 0.0, 0.27], // C3
  [196.0, 0.27, 0.2], // G3
  [174.61, 0.48, 0.27], // F3
  [261.63, 0.78, 0.55], // C4
];

function playNotes(
  ctx: AudioContext,
  notes: Note[],
  type: OscillatorType,
  volume: number,
) {
  const start = ctx.currentTime + 0.05;
  for (const [frequency, at, length] of notes) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    // A hard attack and a short fade, like a chiptune channel.
    gain.gain.setValueAtTime(0, start + at);
    gain.gain.linearRampToValueAtTime(volume, start + at + 0.005);
    gain.gain.setValueAtTime(volume, start + at + length * 0.7);
    gain.gain.linearRampToValueAtTime(0, start + at + length);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start + at);
    oscillator.stop(start + at + length + 0.02);
  }
}

export function playVictory() {
  const ctx = audio();
  if (!ctx) return;
  playNotes(ctx, MELODY, "square", 0.07);
  playNotes(ctx, BASS, "triangle", 0.12);
}
