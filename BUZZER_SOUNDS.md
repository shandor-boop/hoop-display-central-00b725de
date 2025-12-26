# Updating Buzzer Sound Effects

The scoreboard currently uses **synthetic buzzer sounds** generated with the Web Audio API. There are two ways to update the sounds:

## Option 1: Modify Existing Synthetic Sounds (Current Method)

The buzzer sounds are defined in `src/utils/buzzer.ts`. You can adjust the parameters:

### Game Clock Buzzer Parameters:
- **Frequency**: Starts at 400Hz, ramps down to 200Hz
- **Duration**: 0.5 seconds
- **Volume**: Starts at 0.3, fades out
- **Waveform**: Sine wave (default)

### Shot Clock Buzzer Parameters:
- **Frequency**: Starts at 800Hz, ramps down to 600Hz
- **Duration**: 0.2 seconds
- **Volume**: Starts at 0.3, fades out
- **Waveform**: Sine wave (default)

### How to Modify:

Edit `src/utils/buzzer.ts`:

```typescript
// Example: Make game clock buzzer longer and lower
export function playGameClockBuzzer(): void {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Adjust these values:
  oscillator.frequency.setValueAtTime(350, ctx.currentTime);  // Starting frequency (lower = deeper)
  oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.8);  // End frequency, duration (0.8s)
  
  gainNode.gain.setValueAtTime(0.4, ctx.currentTime);  // Volume (0.0 to 1.0)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.8);  // Match duration here
}

// You can also change the waveform type:
oscillator.type = 'square';  // Options: 'sine', 'square', 'sawtooth', 'triangle'
```

### Parameters You Can Adjust:
- **Frequency**: Higher = more piercing/sharp, Lower = deeper/more bass
- **Duration**: How long the sound plays (in seconds)
- **Volume/Gain**: 0.0 (silent) to 1.0 (full volume)
- **Waveform Type**: 
  - `'sine'` - Smooth, pure tone (current)
  - `'square'` - Harsh, buzzy
  - `'sawtooth'` - Bright, sharp
  - `'triangle'` - Softer than square, more mellow

## Option 2: Use Audio Files (MP3/WAV/OGG)

If you want to use actual buzzer sound files:

### Step 1: Add Audio Files
1. Create a folder: `src/assets/sounds/`
2. Add your audio files:
   - `game-clock-buzzer.mp3` (or .wav, .ogg)
   - `shot-clock-buzzer.mp3` (or .wav, .ogg)

### Step 2: Update `src/utils/buzzer.ts`

Replace the file with this code:

```typescript
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
```

### Step 3: Update Vite Config (if needed)

If Vite doesn't recognize your audio files, you may need to add them to the build. Usually this works automatically, but if not, check `vite.config.ts`.

### Step 4: Test
Run `npm run dev` and test the buzzer buttons to ensure the sounds play correctly.

## Tips for Audio Files

- **Format**: MP3 is most compatible, but WAV/OGG also work
- **Length**: Keep files short (0.5-2 seconds) for buzzer sounds
- **Volume**: Normalize audio files to consistent levels
- **File Size**: Compress audio files to keep bundle size small
- **Browser Compatibility**: Test in different browsers

## Current Implementation Location

- **File**: `src/utils/buzzer.ts`
- **Used in**: `src/hooks/useGameState.ts` (automatic triggers) and `src/components/Scoreboard.tsx` (test buttons)

## Testing Changes

After modifying buzzer sounds:
1. Run `npm run dev`
2. Click the "🔊 Test" buttons (you'll need to click twice - first shows "Sure?", second plays sound)
3. Test automatic triggers by letting clocks reach zero

