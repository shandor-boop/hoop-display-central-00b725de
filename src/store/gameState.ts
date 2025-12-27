// Simple game state management with localStorage and BroadcastChannel

export interface Team {
  name: string;
  score: number;
  fouls: number;
  timeouts: number;
}

export interface GameState {
  home: Team;
  away: Team;
  period: number;
  gameClockMinutes: number;
  gameClockSeconds: number;
  shotClockSeconds: number;
  defaultShotClockSeconds: number; // Default shot clock duration (24 for NBA/FIBA, 30 for NCAA)
  shotClockEnabled: boolean; // Whether shot clock is enabled for this game
  possession: 'home' | 'away';
  gameClockRunning: boolean;
  shotClockRunning: boolean;
  buzzerEnabled: boolean;
}

const STORAGE_KEY = 'basketball-scoreboard-state';
const BROADCAST_CHANNEL = 'basketball-scoreboard';

export const initialState: GameState = {
  home: { name: 'HOME', score: 0, fouls: 0, timeouts: 7 }, // NBA: 7 per game, NCAA: 6, High School: 5
  away: { name: 'AWAY', score: 0, fouls: 0, timeouts: 7 },
  period: 1,
  gameClockMinutes: 12, // NBA quarter length (NCAA: 20 min halves, FIBA: 10 min quarters, High School: 8 min quarters)
  gameClockSeconds: 0,
  shotClockSeconds: 24, // Current shot clock value
  defaultShotClockSeconds: 24, // NBA/FIBA: 24 seconds, NCAA/High School: 30 seconds
  shotClockEnabled: true, // Shot clock enabled by default (can be disabled for some leagues)
  possession: 'home',
  gameClockRunning: false,
  shotClockRunning: false,
  buzzerEnabled: true,
};

// Load from localStorage
export function loadState(): GameState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.home && parsed.away) {
        return { ...initialState, ...parsed };
      }
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
  return initialState;
}

// Save to localStorage
export function saveState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

// BroadcastChannel for multi-window sync
let broadcastChannel: BroadcastChannel | null = null;

export function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  
  if (!broadcastChannel) {
    try {
      broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL);
    } catch (error) {
      console.error('Failed to create BroadcastChannel:', error);
      return null;
    }
  }
  return broadcastChannel;
}

// Broadcast state to other windows
export function broadcastState(state: GameState): void {
  const channel = getBroadcastChannel();
  if (channel) {
    try {
      channel.postMessage({ type: 'STATE_UPDATE', state });
    } catch (error) {
      console.error('Failed to broadcast state:', error);
    }
  }
}

// Listen for state updates from other windows
export function onStateUpdate(callback: (state: GameState) => void): () => void {
  const channel = getBroadcastChannel();
  if (!channel) return () => {};
  
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'STATE_UPDATE') {
      callback(event.data.state);
    }
  };
  
  channel.addEventListener('message', handler);
  return () => channel.removeEventListener('message', handler);
}

