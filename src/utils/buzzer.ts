// Buzzer sound system using audio files
// Import audio files
import gameClockSound from '../assets/sounds/game-clock-buzzer.mp3';
import shotClockSound from '../assets/sounds/shot-clock-buzzer.mp3';

let gameClockAudio: HTMLAudioElement | null = null;
let shotClockAudio: HTMLAudioElement | null = null;

function getGameClockAudio(): HTMLAudioElement {
  if (!gameClockAudio) {
    gameClockAudio = new Audio(gameClockSound);
    gameClockAudio.volume = 0.7; // Adjust volume (0.0 to 1.0)
  }
  return gameClockAudio;
}

function getShotClockAudio(): HTMLAudioElement {
  if (!shotClockAudio) {
    shotClockAudio = new Audio(shotClockSound);
    shotClockAudio.volume = 0.7; // Adjust volume (0.0 to 1.0)
  }
  return shotClockAudio;
}

export function playGameClockBuzzer(): void {
  const audio = getGameClockAudio();
  audio.currentTime = 0; // Reset to start
  audio.play().catch((error) => {
    console.error('Failed to play game clock buzzer:', error);
  });
}

export function playShotClockBuzzer(): void {
  const audio = getShotClockAudio();
  audio.currentTime = 0; // Reset to start
  audio.play().catch((error) => {
    console.error('Failed to play shot clock buzzer:', error);
  });
}

