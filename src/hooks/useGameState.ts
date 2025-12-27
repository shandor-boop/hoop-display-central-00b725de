import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  loadState,
  saveState,
  broadcastState,
  onStateUpdate,
} from '../store/gameState';
import { playGameClockBuzzer, playShotClockBuzzer } from '../utils/buzzer';

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Listen for updates from other windows
  useEffect(() => {
    const cleanup = onStateUpdate((newState) => {
      setState(newState);
    });
    return cleanup;
  }, []);

  // Update function that broadcasts changes
  const updateState = useCallback((updates: Partial<GameState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      broadcastState(next);
      return next;
    });
  }, []);

  // Helper functions for common updates
  const updateTeam = useCallback(
    (team: 'home' | 'away', updates: Partial<GameState['home']>) => {
      setState((prev) => {
        const next = {
          ...prev,
          [team]: { ...prev[team], ...updates },
        };
        broadcastState(next);
        return next;
      });
    },
    []
  );

  const adjustScore = useCallback((team: 'home' | 'away', points: number) => {
    setState((prev) => {
      const newScore = Math.max(0, prev[team].score + points);
      const next = {
        ...prev,
        [team]: { ...prev[team], score: newScore },
      };
      broadcastState(next);
      return next;
    });
  }, []);

  const adjustGameClock = useCallback((minutes: number, seconds: number) => {
    setState((prev) => {
      const newMinutes = Math.max(0, Math.min(99, prev.gameClockMinutes + minutes));
      const newSeconds = Math.max(0, Math.min(59, prev.gameClockSeconds + seconds));
      const next = {
        ...prev,
        gameClockMinutes: newMinutes,
        gameClockSeconds: newSeconds,
      };
      broadcastState(next);
      return next;
    });
  }, []);

  // Track if we've already played buzzer to avoid multiple plays
  const gameClockBuzzerPlayed = useRef(false);
  const shotClockBuzzerPlayed = useRef(false);
  
  // Reset buzzer flags when game clock is manually adjusted or started
  useEffect(() => {
    if (state.gameClockRunning && (state.gameClockMinutes > 0 || state.gameClockSeconds > 0)) {
      gameClockBuzzerPlayed.current = false;
    }
  }, [state.gameClockMinutes, state.gameClockSeconds, state.gameClockRunning]);
  
  // Reset buzzer flag when shot clock is reset
  useEffect(() => {
    if (state.shotClockSeconds > 0) {
      shotClockBuzzerPlayed.current = false;
    }
  }, [state.shotClockSeconds]);

  // Clock tick handlers (only run in one window)
  useEffect(() => {
    if (!state.gameClockRunning) return;

    const timer = setInterval(() => {
      setState((prev) => {
        if (!prev.gameClockRunning) return prev;
        
        const totalSeconds = prev.gameClockMinutes * 60 + prev.gameClockSeconds;
        if (totalSeconds <= 0) {
          // Game clock reached zero - play buzzer if enabled and not already played
          if (prev.buzzerEnabled && !gameClockBuzzerPlayed.current) {
            playGameClockBuzzer();
            gameClockBuzzerPlayed.current = true;
          }
          const next = { ...prev, gameClockRunning: false };
          broadcastState(next);
          return next;
        }
        
        // Reset buzzer flag when clock is running again
        if (totalSeconds > 0) {
          gameClockBuzzerPlayed.current = false;
        }

        const newTotalSeconds = totalSeconds - 1;
        const next = {
          ...prev,
          gameClockMinutes: Math.floor(newTotalSeconds / 60),
          gameClockSeconds: newTotalSeconds % 60,
        };
        broadcastState(next);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.gameClockRunning]);

  useEffect(() => {
    if (!state.shotClockRunning || !state.shotClockEnabled) return;

    const timer = setInterval(() => {
      setState((prev) => {
        if (!prev.shotClockRunning || !prev.shotClockEnabled) return prev;
        
        if (prev.shotClockSeconds <= 0) {
          // Shot clock reached zero - play buzzer if enabled and not already played
          if (prev.buzzerEnabled && !shotClockBuzzerPlayed.current) {
            playShotClockBuzzer();
            shotClockBuzzerPlayed.current = true;
          }
          const next = { ...prev, shotClockRunning: false };
          broadcastState(next);
          return next;
        }
        
        // Reset buzzer flag when shot clock is reset
        if (prev.shotClockSeconds > 0) {
          shotClockBuzzerPlayed.current = false;
        }

        const next = {
          ...prev,
          shotClockSeconds: prev.shotClockSeconds - 1,
        };
        broadcastState(next);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.shotClockRunning, state.shotClockEnabled]);

  // Format helpers
  const formatGameClock = useCallback(() => {
    const minutes = state.gameClockMinutes.toString().padStart(2, '0');
    const seconds = state.gameClockSeconds.toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [state.gameClockMinutes, state.gameClockSeconds]);

  const formatShotClock = useCallback(() => {
    return state.shotClockSeconds.toString().padStart(2, '0');
  }, [state.shotClockSeconds]);

  return {
    state,
    updateState,
    updateTeam,
    adjustScore,
    adjustGameClock,
    formatGameClock,
    formatShotClock,
  };
}

