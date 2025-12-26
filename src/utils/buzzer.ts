// Buzzer sound system using Web Audio API
// No external audio files needed!

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Game clock buzzer - longer, more urgent sound
export function playGameClockBuzzer(): void {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Lower frequency, longer duration for game clock
  oscillator.frequency.setValueAtTime(400, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);

  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.5);
}

// Shot clock buzzer - shorter, sharper sound
export function playShotClockBuzzer(): void {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Higher frequency, shorter duration for shot clock
  oscillator.frequency.setValueAtTime(800, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);

  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.2);
}

