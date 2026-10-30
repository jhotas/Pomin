/**
 * The app's 8-bit sounds, played on square and triangle waves through Web
 * Audio, so there are no sound files to load.
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
 * a sound can play when a phase ends later.
 */
export function unlockAudio() {
  audio();
}

/** [frequency in Hz, start in seconds, length in seconds] */
type Note = [number, number, number];

function playNotes(notes: Note[], type: OscillatorType, volume: number) {
  const ctx = audio();
  if (!ctx) return;
  const start = ctx.currentTime + 0.01;
  for (const [frequency, at, length] of notes) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    // A hard attack and a short fade, like a chiptune channel.
    gain.gain.setValueAtTime(0, start + at);
    gain.gain.linearRampToValueAtTime(volume, start + at + 0.004);
    gain.gain.setValueAtTime(volume, start + at + length * 0.7);
    gain.gain.linearRampToValueAtTime(0, start + at + length);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start + at);
    oscillator.stop(start + at + length + 0.02);
  }
}

/** A short, quiet blip for a button press. */
export function playClick() {
  playNotes(
    [
      [1318.51, 0, 0.025], // E6
      [1760.0, 0.025, 0.03], // A6
    ],
    "square",
    0.025,
  );
}

/** A bright two-note chime for a finished focus block. */
export function playPomoDone() {
  playNotes(
    [
      [783.99, 0, 0.1], // G5
      [1046.5, 0.1, 0.1], // C6
      [1567.98, 0.2, 0.28], // G6
    ],
    "square",
    0.06,
  );
  playNotes([[261.63, 0, 0.45]], "triangle", 0.1); // C4
}

/** A falling call back to work when a break runs out. */
export function playBreakOver() {
  playNotes(
    [
      [1046.5, 0, 0.09], // C6
      [880.0, 0.12, 0.09], // A5
      [1046.5, 0.24, 0.09], // C6
      [880.0, 0.36, 0.2], // A5
    ],
    "square",
    0.05,
  );
}

// An original rising jingle: a quick arpeggio, a bounce, and a held top note.
const VICTORY_MELODY: Note[] = [
  [523.25, 0.0, 0.09], // C5
  [659.25, 0.09, 0.09], // E5
  [783.99, 0.18, 0.09], // G5
  [1046.5, 0.27, 0.18], // C6
  [880.0, 0.48, 0.09], // A5
  [987.77, 0.57, 0.09], // B5
  [1046.5, 0.66, 0.09], // C6
  [1318.51, 0.78, 0.55], // E6
];

const VICTORY_BASS: Note[] = [
  [130.81, 0.0, 0.27], // C3
  [196.0, 0.27, 0.2], // G3
  [174.61, 0.48, 0.27], // F3
  [261.63, 0.78, 0.55], // C4
];

/** A short fanfare for a finished round of focus blocks. */
export function playVictory() {
  playNotes(VICTORY_MELODY, "square", 0.07);
  playNotes(VICTORY_BASS, "triangle", 0.12);
}
