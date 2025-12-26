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
  possession: 'home' | 'away';
  gameClockRunning: boolean;
  shotClockRunning: boolean;
  buzzerEnabled: boolean;
}

const STORAGE_KEY = 'basketball-scoreboard-state';
const BROADCAST_CHANNEL = 'basketball-scoreboard';

export const initialState: GameState = {
  home: { name: 'HOME', score: 0, fouls: 0, timeouts: 5 },
  away: { name: 'AWAY', score: 0, fouls: 0, timeouts: 5 },
  period: 1,
  gameClockMinutes: 12,
  gameClockSeconds: 0,
  shotClockSeconds: 24,
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

