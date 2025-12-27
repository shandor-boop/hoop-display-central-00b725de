import { useEffect, useState, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import { Button } from './Button';
import { playGameClockBuzzer, playShotClockBuzzer } from '../utils/buzzer';

export function Scoreboard() {
  const {
    state,
    updateState,
    updateTeam,
    adjustScore,
    adjustGameClock,
    formatGameClock,
    formatShotClock,
  } = useGameState();

  const [gameClockBuzzerText, setGameClockBuzzerText] = useState('🔊 Test');
  const [shotClockBuzzerText, setShotClockBuzzerText] = useState('🔊 Test');
  const gameClockBuzzerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shotClockBuzzerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gameClockBuzzerClickedRef = useRef(false);
  const shotClockBuzzerClickedRef = useRef(false);

  const handleGameClockBuzzer = () => {
    if (!gameClockBuzzerClickedRef.current) {
      // First click - show "Sure?"
      gameClockBuzzerClickedRef.current = true;
      setGameClockBuzzerText('Sure?');
      
      // Clear any existing timeout
      if (gameClockBuzzerTimeoutRef.current) {
        clearTimeout(gameClockBuzzerTimeoutRef.current);
      }
      
      // Set timeout to revert after 3 seconds
      gameClockBuzzerTimeoutRef.current = setTimeout(() => {
        setGameClockBuzzerText('🔊 Test');
        gameClockBuzzerClickedRef.current = false;
      }, 3000);
    } else {
      // Second click - play sound
      playGameClockBuzzer();
      setGameClockBuzzerText('🔊 Test');
      gameClockBuzzerClickedRef.current = false;
      
      // Clear timeout
      if (gameClockBuzzerTimeoutRef.current) {
        clearTimeout(gameClockBuzzerTimeoutRef.current);
      }
    }
  };

  const handleShotClockBuzzer = () => {
    if (!shotClockBuzzerClickedRef.current) {
      // First click - show "Sure?"
      shotClockBuzzerClickedRef.current = true;
      setShotClockBuzzerText('Sure?');
      
      // Clear any existing timeout
      if (shotClockBuzzerTimeoutRef.current) {
        clearTimeout(shotClockBuzzerTimeoutRef.current);
      }
      
      // Set timeout to revert after 3 seconds
      shotClockBuzzerTimeoutRef.current = setTimeout(() => {
        setShotClockBuzzerText('🔊 Test');
        shotClockBuzzerClickedRef.current = false;
      }, 3000);
    } else {
      // Second click - play sound
      playShotClockBuzzer();
      setShotClockBuzzerText('🔊 Test');
      shotClockBuzzerClickedRef.current = false;
      
      // Clear timeout
      if (shotClockBuzzerTimeoutRef.current) {
        clearTimeout(shotClockBuzzerTimeoutRef.current);
      }
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (gameClockBuzzerTimeoutRef.current) {
        clearTimeout(gameClockBuzzerTimeoutRef.current);
      }
      if (shotClockBuzzerTimeoutRef.current) {
        clearTimeout(shotClockBuzzerTimeoutRef.current);
      }
    };
  }, []);

  const adjustFouls = (team: 'home' | 'away', change: number) => {
    const newFouls = Math.max(0, state[team].fouls + change);
    updateTeam(team, { fouls: newFouls });
  };

  const adjustTimeouts = (team: 'home' | 'away', change: number) => {
    const newTimeouts = Math.max(0, Math.min(7, state[team].timeouts + change)); // NBA: 7, NCAA: 6, High School: 5
    updateTeam(team, { timeouts: newTimeouts });
  };

  const adjustPeriod = (change: number) => {
    const newPeriod = Math.max(1, Math.min(4, state.period + change));
    // When period changes, reset shot clock to default (new period = new possession)
    updateState({ 
      period: newPeriod,
      shotClockSeconds: state.defaultShotClockSeconds,
      shotClockRunning: false, // Don't auto-start, let user start when ready
    });
  };

  // Handle possession change - resets and starts shot clock (basketball rule: shot clock resets on possession change)
  const togglePossession = () => {
    const newPossession = state.possession === 'home' ? 'away' : 'home';
    // Only reset/start shot clock if it's enabled
    if (state.shotClockEnabled) {
      const defaultSeconds = state.defaultShotClockSeconds;
      // Stop timer first, then restart to ensure it counts down from the reset value
      updateState({ 
        possession: newPossession,
        shotClockSeconds: defaultSeconds, // Reset to default (24s NBA/FIBA, 30s NCAA)
        shotClockRunning: false, // Stop the timer to force restart
      });
      // Restart timer immediately after state update to begin countdown from default
      setTimeout(() => {
        updateState({ shotClockRunning: true });
      }, 0);
    } else {
      updateState({ 
        possession: newPossession,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-1 sm:p-2 md:p-4" style={{ backgroundColor: '#141414' }}>
      <div className="w-full max-w-7xl rounded-lg p-1 sm:p-2 md:p-4 lg:p-6" style={{ backgroundColor: '#141414' }}>
        {/* Top Section: Clock */}
        <div className="flex justify-center mb-2 sm:mb-4 md:mb-6">
          <div className="flex flex-col items-center justify-center w-full">
            <div className="border-2 border-white bg-black px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 mb-2 w-full max-w-[420px]">
              <div className="text-[clamp(2rem,6vw,5.5rem)] font-black clock-font text-yellow-500 text-center leading-none">
                {formatGameClock()}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mt-1 sm:mt-2">
              <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                <label className="text-[clamp(0.625rem,1.5vw,0.75rem)] text-white uppercase font-bold">Minutes</label>
                <div className="flex gap-0.5 sm:gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustGameClock(1, 0)}
                    className="h-[clamp(1.5rem,4vw,2rem)] w-[clamp(1.5rem,4vw,2rem)] p-0 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                    title="Increase minutes"
                  >
                    <svg className="w-[clamp(0.5rem,1.5vw,0.75rem)] h-[clamp(0.5rem,1.5vw,0.75rem)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M18 15l-6-6-6 6"/>
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustGameClock(-1, 0)}
                    className="h-[clamp(1.5rem,4vw,2rem)] w-[clamp(1.5rem,4vw,2rem)] p-0 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                    title="Decrease minutes"
                  >
                    <svg className="w-[clamp(0.5rem,1.5vw,0.75rem)] h-[clamp(0.5rem,1.5vw,0.75rem)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                <label className="text-[clamp(0.625rem,1.5vw,0.75rem)] text-white uppercase font-bold">Seconds</label>
                <div className="flex gap-0.5 sm:gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustGameClock(0, 1)}
                    className="h-[clamp(1.5rem,4vw,2rem)] w-[clamp(1.5rem,4vw,2rem)] p-0 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                    title="Increase seconds"
                  >
                    <svg className="w-[clamp(0.5rem,1.5vw,0.75rem)] h-[clamp(0.5rem,1.5vw,0.75rem)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M18 15l-6-6-6 6"/>
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustGameClock(0, -1)}
                    className="h-[clamp(1.5rem,4vw,2rem)] w-[clamp(1.5rem,4vw,2rem)] p-0 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                    title="Decrease seconds"
                  >
                    <svg className="w-[clamp(0.5rem,1.5vw,0.75rem)] h-[clamp(0.5rem,1.5vw,0.75rem)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 sm:gap-2 mt-1 sm:mt-2">
              <Button
                variant={state.gameClockRunning ? 'destructive' : 'default'}
                size="sm"
                onClick={() => updateState({ gameClockRunning: !state.gameClockRunning })}
                className="px-2 sm:px-3 py-0.5 sm:py-1 text-[clamp(0.625rem,1.5vw,0.75rem)] focus:outline-none"
              >
                {state.gameClockRunning ? '⏸ Stop' : '▶ Start'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGameClockBuzzer}
                className="text-[clamp(0.625rem,1.5vw,0.75rem)] px-2 sm:px-3 py-0.5 sm:py-1 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                title="Test buzzer"
              >
                {gameClockBuzzerText}
              </Button>
            </div>
          </div>
        </div>

        {/* Middle Section: Scores, Fouls, Period */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-2 sm:mb-4 md:mb-6">
          {/* Left: Home Score and Fouls */}
          <div className="text-center flex flex-col items-center">
            <input
              type="text"
              value={state.home.name}
              onChange={(e) => updateTeam('home', { name: e.target.value })}
              className="text-[clamp(1rem,3vw,1.875rem)] font-bold text-white bg-transparent border-none text-center focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded px-1 sm:px-2 cursor-text uppercase mb-1 sm:mb-2 w-full hover:bg-gray-800/30 hover:underline transition-all"
              style={{ backgroundColor: '#141414' }}
              placeholder="HOME"
            />
            <div className="border-2 border-white bg-black px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 mb-2 sm:mb-3 md:mb-4 w-full">
              <div className="text-[clamp(2.5rem,8vw,8rem)] font-black clock-font text-red-500 text-center leading-none">
                {state.home.score}
              </div>
            </div>
            <div className="flex justify-center gap-0.5 sm:gap-1 md:gap-2 mb-2 sm:mb-3 md:mb-4">
              <Button variant="outline" size="sm" onClick={() => adjustScore('home', 1)} className="text-white border-white hover:bg-white hover:text-black focus:outline-none text-[clamp(0.625rem,1.5vw,0.875rem)] px-1 sm:px-2 md:px-3 py-0.5 sm:py-1">
                +1
              </Button>
              <Button variant="outline" size="sm" onClick={() => adjustScore('home', 2)} className="text-white border-white hover:bg-white hover:text-black focus:outline-none text-[clamp(0.625rem,1.5vw,0.875rem)] px-1 sm:px-2 md:px-3 py-0.5 sm:py-1">
                +2
              </Button>
              <Button variant="outline" size="sm" onClick={() => adjustScore('home', 3)} className="text-white border-white hover:bg-white hover:text-black focus:outline-none text-[clamp(0.625rem,1.5vw,0.875rem)] px-1 sm:px-2 md:px-3 py-0.5 sm:py-1">
                +3
              </Button>
              <Button variant="outline" size="sm" onClick={() => adjustScore('home', -1)} className="text-white border-white hover:bg-white hover:text-black focus:outline-none text-[clamp(0.625rem,1.5vw,0.875rem)] px-1 sm:px-2 md:px-3 py-0.5 sm:py-1">
                -1
              </Button>
            </div>
            <div className="mb-1 sm:mb-2">
              <div className="text-[clamp(0.625rem,1.5vw,0.875rem)] text-white mb-0.5 sm:mb-1 uppercase font-bold">FOULS</div>
              <div className="inline-flex items-center justify-center">
                <div className="bg-black border-2 border-white text-orange-500 text-[clamp(1.25rem,3vw,1.5rem)] font-black clock-font px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-2 min-w-[clamp(2.5rem,6vw,3.75rem)] text-center">
                  {state.home.fouls}
                </div>
                <div className="flex flex-col ml-1 sm:ml-2 gap-0.5 sm:gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustFouls('home', 1)}
                    className="h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(1.25rem,3vw,1.5rem)] p-0 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                  >
                    <svg className="w-[clamp(0.4rem,1vw,0.625rem)] h-[clamp(0.4rem,1vw,0.625rem)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M18 15l-6-6-6 6"/>
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustFouls('home', -1)}
                    className="h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(1.25rem,3vw,1.5rem)] p-0 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                  >
                    <svg className="w-[clamp(0.4rem,1vw,0.625rem)] h-[clamp(0.4rem,1vw,0.625rem)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-1 sm:mt-2">
              <div className="text-[clamp(0.625rem,1.5vw,0.75rem)] text-white mb-0.5 sm:mb-1 font-bold">Timeouts: {state.home.timeouts}</div>
              <div className="flex gap-0.5 sm:gap-1 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustTimeouts('home', -1)}
                  className="h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(1.25rem,3vw,1.5rem)] p-0 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                >
                  <svg className="w-[clamp(0.4rem,1vw,0.625rem)] h-[clamp(0.4rem,1vw,0.625rem)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustTimeouts('home', 1)}
                  className="h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(1.25rem,3vw,1.5rem)] p-0 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                >
                  <svg className="w-[clamp(0.4rem,1vw,0.625rem)] h-[clamp(0.4rem,1vw,0.625rem)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M18 15l-6-6-6 6"/>
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {/* Center: Period and Shot Clock */}
          <div className="text-center flex flex-col items-center">
            <div className="mb-2 sm:mb-3 md:mb-4">
              <div className="text-[clamp(0.625rem,1.5vw,0.875rem)] text-white mb-0.5 sm:mb-1 uppercase font-bold">PERIOD</div>
              <div className="border-2 border-white bg-black px-2 sm:px-4 md:px-6 py-1.5 sm:py-3 md:py-4 mb-1 sm:mb-2 w-full max-w-[clamp(4rem,12vw,7.5rem)] mx-auto">
                <div className="text-[clamp(2.5rem,8vw,8rem)] font-black clock-font text-yellow-500 text-center leading-none">
                  {state.period}
                </div>
              </div>
              <div className="flex items-center justify-center gap-0.5 sm:gap-1 mt-1 sm:mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustPeriod(-1)}
                  className="h-[clamp(1.5rem,4vw,2rem)] w-[clamp(1.5rem,4vw,2rem)] p-0 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                >
                  <svg className="w-[clamp(0.5rem,1.5vw,0.75rem)] h-[clamp(0.5rem,1.5vw,0.75rem)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustPeriod(1)}
                  className="h-[clamp(1.5rem,4vw,2rem)] w-[clamp(1.5rem,4vw,2rem)] p-0 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                >
                  <svg className="w-[clamp(0.5rem,1.5vw,0.75rem)] h-[clamp(0.5rem,1.5vw,0.75rem)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M18 15l-6-6-6 6"/>
                  </svg>
                </Button>
              </div>
            </div>
            <div className="mb-2 sm:mb-3 md:mb-4">
              <div className="text-[clamp(0.625rem,1.5vw,0.75rem)] text-white mb-1 sm:mb-2 uppercase font-bold">Shot Clock</div>
              <div className={`inline-block border-2 border-white bg-black px-2 sm:px-3 md:px-4 py-1 sm:py-2 mb-1 sm:mb-2 w-full max-w-[clamp(4.5rem,14vw,8.75rem)] ${!state.shotClockEnabled ? 'opacity-50' : ''}`}>
                <div className={`text-[clamp(1.5rem,5vw,4rem)] font-black clock-font text-center leading-none ${state.shotClockEnabled ? 'text-yellow-500' : 'text-gray-500'}`}>
                  {state.shotClockEnabled ? formatShotClock() : '--'}
                </div>
              </div>
              {state.shotClockEnabled && (
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                    <label className="text-[clamp(0.625rem,1.5vw,0.75rem)] text-white uppercase font-bold">Seconds</label>
                    <div className="flex gap-0.5 sm:gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const current = state.shotClockSeconds;
                          updateState({ shotClockSeconds: Math.min(state.defaultShotClockSeconds, current + 1) });
                        }}
                        className="h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(1.25rem,3vw,1.5rem)] p-0 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                      >
                        <svg className="w-[clamp(0.4rem,1vw,0.625rem)] h-[clamp(0.4rem,1vw,0.625rem)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M18 15l-6-6-6 6"/>
                        </svg>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const current = state.shotClockSeconds;
                          updateState({ shotClockSeconds: Math.max(0, current - 1) });
                        }}
                        className="h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(1.25rem,3vw,1.5rem)] p-0 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                      >
                        <svg className="w-[clamp(0.4rem,1vw,0.625rem)] h-[clamp(0.4rem,1vw,0.625rem)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Set default shot clock to 24s (NBA/FIBA) and reset current to that value
                    updateState({ 
                      defaultShotClockSeconds: 24,
                      shotClockSeconds: 24,
                    });
                  }}
                  className={`text-[clamp(0.625rem,1.5vw,0.75rem)] px-1 sm:px-2 py-0.5 sm:py-1 text-white border-white hover:bg-white hover:text-black focus:outline-none ${state.defaultShotClockSeconds === 24 ? 'border-yellow-400 border-2' : ''}`}
                  title="Set default to 24s (NBA/FIBA)"
                >
                  24s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Set default shot clock to 30s (NCAA/High School) and reset current to that value
                    updateState({ 
                      defaultShotClockSeconds: 30,
                      shotClockSeconds: 30,
                    });
                  }}
                  className={`text-[clamp(0.625rem,1.5vw,0.75rem)] px-1 sm:px-2 py-0.5 sm:py-1 text-white border-white hover:bg-white hover:text-black focus:outline-none ${state.defaultShotClockSeconds === 30 ? 'border-yellow-400 border-2' : ''}`}
                  title="Set default to 30s (NCAA/High School)"
                >
                  30s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Set default shot clock to 14s and reset current to that value
                    updateState({ 
                      defaultShotClockSeconds: 14,
                      shotClockSeconds: 14,
                    });
                  }}
                  className={`text-[clamp(0.625rem,1.5vw,0.75rem)] px-1 sm:px-2 py-0.5 sm:py-1 text-white border-white hover:bg-white hover:text-black focus:outline-none ${state.defaultShotClockSeconds === 14 ? 'border-yellow-400 border-2' : ''}`}
                  title="Set default to 14s (offensive rebound - NBA/FIBA rule)"
                >
                  14s
                </Button>
                <Button
                  variant={state.shotClockEnabled ? 'default' : 'destructive'}
                  size="sm"
                  onClick={() => {
                    const newEnabled = !state.shotClockEnabled;
                    updateState({ 
                      shotClockEnabled: newEnabled,
                      shotClockRunning: newEnabled ? state.shotClockRunning : false, // Stop if disabling
                    });
                  }}
                  className="text-[clamp(0.625rem,1.5vw,0.75rem)] px-1 sm:px-2 py-0.5 sm:py-1 focus:outline-none"
                  title={state.shotClockEnabled ? 'Disable shot clock' : 'Enable shot clock'}
                >
                  {state.shotClockEnabled ? 'ON' : 'OFF'}
                </Button>
                {state.shotClockEnabled && (
                  <Button
                    variant={state.shotClockRunning ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => updateState({ shotClockRunning: !state.shotClockRunning })}
                    className="text-[clamp(0.625rem,1.5vw,0.75rem)] px-1 sm:px-2 py-0.5 sm:py-1 focus:outline-none"
                  >
                    {state.shotClockRunning ? '⏸ Stop' : '▶ Start'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShotClockBuzzer}
                  className="text-[clamp(0.625rem,1.5vw,0.75rem)] px-1 sm:px-2 py-0.5 sm:py-1 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                  title="Test buzzer"
                >
                  {shotClockBuzzerText}
                </Button>
              </div>
            </div>
            <div className="mt-2 sm:mt-3 md:mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePossession}
                className="text-[clamp(0.625rem,1.5vw,0.75rem)] px-1 sm:px-2 md:px-3 py-0.5 sm:py-1 text-white border-white hover:bg-white hover:text-black uppercase font-bold focus:outline-none"
              >
                POSSESSION
              </Button>
              <div className="flex items-center justify-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                <div
                  className={`w-0 h-0 border-t-[clamp(0.5rem,1.5vw,0.75rem)] border-b-[clamp(0.5rem,1.5vw,0.75rem)] border-r-[clamp(0.8rem,2.5vw,1.25rem)] 
                    border-t-transparent border-b-transparent transition-all cursor-pointer ${
                    state.possession === 'away'
                      ? 'border-r-yellow-500 opacity-100'
                      : 'border-r-white opacity-30'
                  }`}
                  onClick={togglePossession}
                />
                <div
                  className={`w-0 h-0 border-t-[clamp(0.5rem,1.5vw,0.75rem)] border-b-[clamp(0.5rem,1.5vw,0.75rem)] border-l-[clamp(0.8rem,2.5vw,1.25rem)] 
                    border-t-transparent border-b-transparent transition-all cursor-pointer ${
                    state.possession === 'home'
                      ? 'border-l-yellow-500 opacity-100'
                      : 'border-l-white opacity-30'
                  }`}
                  onClick={togglePossession}
                />
              </div>
            </div>
          </div>

          {/* Right: Away Score and Fouls */}
          <div className="text-center flex flex-col items-center">
            <input
              type="text"
              value={state.away.name}
              onChange={(e) => updateTeam('away', { name: e.target.value })}
              className="text-[clamp(1rem,3vw,1.875rem)] font-bold text-white bg-transparent border-none text-center focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded px-1 sm:px-2 cursor-text uppercase mb-1 sm:mb-2 w-full hover:bg-gray-800/30 hover:underline transition-all"
              style={{ backgroundColor: '#141414' }}
              placeholder="AWAY"
            />
            <div className="border-2 border-white bg-black px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 mb-2 sm:mb-3 md:mb-4 w-full">
              <div className="text-[clamp(2.5rem,8vw,8rem)] font-black clock-font text-red-500 text-center leading-none">
                {state.away.score}
              </div>
            </div>
            <div className="flex justify-center gap-0.5 sm:gap-1 md:gap-2 mb-2 sm:mb-3 md:mb-4">
              <Button variant="outline" size="sm" onClick={() => adjustScore('away', 1)} className="text-white border-white hover:bg-white hover:text-black focus:outline-none text-[clamp(0.625rem,1.5vw,0.875rem)] px-1 sm:px-2 md:px-3 py-0.5 sm:py-1">
                +1
              </Button>
              <Button variant="outline" size="sm" onClick={() => adjustScore('away', 2)} className="text-white border-white hover:bg-white hover:text-black focus:outline-none text-[clamp(0.625rem,1.5vw,0.875rem)] px-1 sm:px-2 md:px-3 py-0.5 sm:py-1">
                +2
              </Button>
              <Button variant="outline" size="sm" onClick={() => adjustScore('away', 3)} className="text-white border-white hover:bg-white hover:text-black focus:outline-none text-[clamp(0.625rem,1.5vw,0.875rem)] px-1 sm:px-2 md:px-3 py-0.5 sm:py-1">
                +3
              </Button>
              <Button variant="outline" size="sm" onClick={() => adjustScore('away', -1)} className="text-white border-white hover:bg-white hover:text-black focus:outline-none text-[clamp(0.625rem,1.5vw,0.875rem)] px-1 sm:px-2 md:px-3 py-0.5 sm:py-1">
                -1
              </Button>
            </div>
            <div className="mb-1 sm:mb-2">
              <div className="text-[clamp(0.625rem,1.5vw,0.875rem)] text-white mb-0.5 sm:mb-1 uppercase font-bold">FOULS</div>
              <div className="inline-flex items-center justify-center">
                <div className="bg-black border-2 border-white text-orange-500 text-[clamp(1.25rem,3vw,1.5rem)] font-black clock-font px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-2 min-w-[clamp(2.5rem,6vw,3.75rem)] text-center">
                  {state.away.fouls}
                </div>
                <div className="flex flex-col ml-1 sm:ml-2 gap-0.5 sm:gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustFouls('away', 1)}
                    className="h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(1.25rem,3vw,1.5rem)] p-0 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                  >
                    <svg className="w-[clamp(0.4rem,1vw,0.625rem)] h-[clamp(0.4rem,1vw,0.625rem)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M18 15l-6-6-6 6"/>
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustFouls('away', -1)}
                    className="h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(1.25rem,3vw,1.5rem)] p-0 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                  >
                    <svg className="w-[clamp(0.4rem,1vw,0.625rem)] h-[clamp(0.4rem,1vw,0.625rem)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-1 sm:mt-2">
              <div className="text-[clamp(0.625rem,1.5vw,0.75rem)] text-white mb-0.5 sm:mb-1 font-bold">Timeouts: {state.away.timeouts}</div>
              <div className="flex gap-0.5 sm:gap-1 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustTimeouts('away', -1)}
                  className="h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(1.25rem,3vw,1.5rem)] p-0 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                >
                  <svg className="w-[clamp(0.4rem,1vw,0.625rem)] h-[clamp(0.4rem,1vw,0.625rem)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustTimeouts('away', 1)}
                  className="h-[clamp(1.25rem,3vw,1.5rem)] w-[clamp(1.25rem,3vw,1.5rem)] p-0 text-white border-white hover:bg-white hover:text-black focus:outline-none"
                >
                  <svg className="w-[clamp(0.4rem,1vw,0.625rem)] h-[clamp(0.4rem,1vw,0.625rem)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M18 15l-6-6-6 6"/>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex flex-col items-center gap-1 mt-4 sm:mt-6">
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }}
            className="text-gray-400 hover:text-gray-300 underline text-xs sm:text-sm focus:outline-none transition-colors"
          >
            Click for fullscreen
          </button>
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('display', 'true');
              window.open(url.toString(), 'scoreboard-display', 'width=1920,height=1080');
            }}
            className="text-gray-400 hover:text-gray-300 underline text-xs sm:text-sm focus:outline-none transition-colors"
          >
            Click for split view
          </button>
        </div>
      </div>
    </div>
  );
}
