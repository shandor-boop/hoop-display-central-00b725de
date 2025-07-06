import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface TeamData {
  name: string;
  score: number;
  fouls: number;
  timeouts: number;
  logo?: string;
}

export interface GameState {
  home: TeamData;
  away: TeamData;
  period: number;
  gameClockMinutes: number;
  gameClockSeconds: number;
  shotClockSeconds: number;
  possession: 'home' | 'away';
  gameClockRunning: boolean;
  shotClockRunning: boolean;
  gameBuzzerEnabled: boolean;
  shotBuzzerEnabled: boolean;
}

type GameAction =
  | { type: 'UPDATE_TEAM'; team: 'home' | 'away'; field: keyof TeamData; value: string | number }
  | { type: 'UPDATE_SCORE'; team: 'home' | 'away'; points: number }
  | { type: 'UPDATE_PERIOD'; value: number }
  | { type: 'UPDATE_GAME_CLOCK'; minutes: number; seconds: number }
  | { type: 'UPDATE_SHOT_CLOCK'; seconds: number }
  | { type: 'TOGGLE_POSSESSION' }
  | { type: 'START_GAME_CLOCK' }
  | { type: 'STOP_GAME_CLOCK' }
  | { type: 'START_SHOT_CLOCK' }
  | { type: 'STOP_SHOT_CLOCK' }
  | { type: 'RESET_SHOT_CLOCK'; seconds: number }
  | { type: 'TOGGLE_BUZZER'; buzzer: 'game' | 'shot' }
  | { type: 'TICK_GAME_CLOCK' }
  | { type: 'TICK_SHOT_CLOCK' };

const initialState: GameState = {
  home: { name: 'HOME', score: 0, fouls: 0, timeouts: 5, logo: undefined },
  away: { name: 'AWAY', score: 0, fouls: 0, timeouts: 5, logo: undefined },
  period: 1,
  gameClockMinutes: 12,
  gameClockSeconds: 0,
  shotClockSeconds: 24,
  possession: 'home',
  gameClockRunning: false,
  shotClockRunning: false,
  gameBuzzerEnabled: true,
  shotBuzzerEnabled: true,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UPDATE_TEAM':
      return {
        ...state,
        [action.team]: {
          ...state[action.team],
          [action.field]: action.value,
        },
      };
    
    case 'UPDATE_SCORE':
      const newScore = Math.max(0, state[action.team].score + action.points);
      return {
        ...state,
        [action.team]: {
          ...state[action.team],
          score: newScore,
        },
      };
    
    case 'UPDATE_PERIOD':
      return { ...state, period: Math.max(1, action.value) };
    
    case 'UPDATE_GAME_CLOCK':
      return {
        ...state,
        gameClockMinutes: Math.max(0, Math.min(59, action.minutes)),
        gameClockSeconds: Math.max(0, Math.min(59, action.seconds)),
      };
    
    case 'UPDATE_SHOT_CLOCK':
      return {
        ...state,
        shotClockSeconds: Math.max(0, Math.min(24, action.seconds)),
      };
    
    case 'TOGGLE_POSSESSION':
      return {
        ...state,
        possession: state.possession === 'home' ? 'away' : 'home',
      };
    
    case 'START_GAME_CLOCK':
      return { ...state, gameClockRunning: true };
    
    case 'STOP_GAME_CLOCK':
      return { ...state, gameClockRunning: false };
    
    case 'START_SHOT_CLOCK':
      return { ...state, shotClockRunning: true };
    
    case 'STOP_SHOT_CLOCK':
      return { ...state, shotClockRunning: false };
    
    case 'RESET_SHOT_CLOCK':
      return { ...state, shotClockSeconds: action.seconds };
    
    case 'TOGGLE_BUZZER':
      return {
        ...state,
        [action.buzzer === 'game' ? 'gameBuzzerEnabled' : 'shotBuzzerEnabled']:
          !state[action.buzzer === 'game' ? 'gameBuzzerEnabled' : 'shotBuzzerEnabled'],
      };
    
    case 'TICK_GAME_CLOCK':
      if (!state.gameClockRunning) return state;
      
      const totalSeconds = state.gameClockMinutes * 60 + state.gameClockSeconds;
      if (totalSeconds <= 0) {
        return { ...state, gameClockRunning: false };
      }
      
      const newTotalSeconds = totalSeconds - 1;
      return {
        ...state,
        gameClockMinutes: Math.floor(newTotalSeconds / 60),
        gameClockSeconds: newTotalSeconds % 60,
      };
    
    case 'TICK_SHOT_CLOCK':
      if (!state.shotClockRunning) return state;
      
      if (state.shotClockSeconds <= 0) {
        return { ...state, shotClockRunning: false };
      }
      
      return {
        ...state,
        shotClockSeconds: state.shotClockSeconds - 1,
      };
    
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  formatGameClock: () => string;
  formatShotClock: () => string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [channel] = React.useState(() => new BroadcastChannel('basketball-scoreboard'));
  const isController = React.useMemo(() => window.location.pathname === '/', []);

  // Enhanced dispatch that broadcasts to other windows
  const enhancedDispatch = React.useCallback((action: GameAction) => {
    console.log('🎮 Dispatching action:', action, 'from path:', window.location.pathname);
    dispatch(action);
    // Broadcast action to other windows
    try {
      channel.postMessage({ type: 'GAME_ACTION', action });
      console.log('📡 Successfully broadcast action to other windows');
    } catch (error) {
      console.error('❌ Failed to broadcast action:', error);
    }
  }, [channel]);

  // Listen for actions from other windows
  React.useEffect(() => {
    console.log('🔗 Setting up BroadcastChannel listener for basketball-scoreboard');
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'GAME_ACTION') {
        console.log('📥 Received action from other window:', event.data.action);
        dispatch(event.data.action);
      }
    };

    channel.addEventListener('message', handleMessage);
    return () => {
      console.log('🔌 Cleaning up BroadcastChannel listener');
      channel.removeEventListener('message', handleMessage);
    };
  }, [channel]);

  // Cleanup channel on unmount
  React.useEffect(() => {
    return () => {
      channel.close();
    };
  }, [channel]);

  const formatGameClock = () => {
    const minutes = state.gameClockMinutes.toString().padStart(2, '0');
    const seconds = state.gameClockSeconds.toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const formatShotClock = () => {
    return state.shotClockSeconds.toString().padStart(2, '0');
  };

  // Clock tick effects - only run in controller window
  React.useEffect(() => {
    if (!isController || !state.gameClockRunning) return;
    
    const timer = setInterval(() => {
      enhancedDispatch({ type: 'TICK_GAME_CLOCK' });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isController, state.gameClockRunning, enhancedDispatch]);

  React.useEffect(() => {
    if (!isController || !state.shotClockRunning) return;
    
    const timer = setInterval(() => {
      enhancedDispatch({ type: 'TICK_SHOT_CLOCK' });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isController, state.shotClockRunning, enhancedDispatch]);

  // Buzzer effects
  React.useEffect(() => {
    if (state.gameClockMinutes === 0 && state.gameClockSeconds === 0 && state.gameBuzzerEnabled) {
      // Game clock buzzer sound would go here
      console.log('Game Clock Buzzer!');
    }
  }, [state.gameClockMinutes, state.gameClockSeconds, state.gameBuzzerEnabled]);

  React.useEffect(() => {
    if (state.shotClockSeconds === 0 && state.shotBuzzerEnabled) {
      // Shot clock buzzer sound would go here
      console.log('Shot Clock Buzzer!');
    }
  }, [state.shotClockSeconds, state.shotBuzzerEnabled]);

  return (
    <GameContext.Provider value={{ state, dispatch: enhancedDispatch, formatGameClock, formatShotClock }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}