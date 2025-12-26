import React, { useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';

export function ScoreboardDisplay() {
  const { state, formatGameClock, formatShotClock } = useGame();

  // Auto-fullscreen on load
  useEffect(() => {    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const renderTimeoutDots = (timeouts: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-3 h-3 rounded-full border-2 ${
          i < timeouts
            ? 'bg-primary border-primary'
            : 'bg-transparent border-muted-foreground/30'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-scoreboard-frame flex items-center justify-center p-2 sm:p-4">
      <div className="scoreboard-display rounded-2xl p-4 sm:p-8 w-full max-w-7xl">
        {/* Main Score Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-4 sm:mb-8">
          {/* Away Team */}
          <div className="text-center">
            <div className="mb-4">
              {state.away.logo && (
                <img
                  src={state.away.logo}
                  alt={`${state.away.name} logo`}
                  className="w-24 h-24 mx-auto mb-4 object-contain"
                />
              )}
              <h2 className="text-xl sm:text-3xl font-bold text-foreground">{state.away.name}</h2>
            </div>
            <div className="led-display rounded-xl p-4 sm:p-6">
              <div className="text-5xl sm:text-8xl font-black clock-font text-center text-foreground">
                {state.away.score}
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-muted-foreground mb-2">FOULS: {state.away.fouls}</div>
              <div className="flex justify-center gap-1">
                {renderTimeoutDots(state.away.timeouts)}
              </div>
            </div>
          </div>
    

          {/* Center Clock Section */}
          <div className="text-center space-y-6">
    
            <div className="led-display rounded-xl p-4 sm:p-6">
              <div className="text-sm sm:text-lg text-muted-foreground mb-2">PERIOD {state.period}</div>
              <div className="text-4xl sm:text-6xl font-black clock-font text-center text-foreground">
                {formatGameClock()}
              </div>
              <div className={`text-xs sm:text-sm mt-2 ${state.gameClockRunning ? 'text-led-green' : 'text-muted-foreground'}`}>
                {state.gameClockRunning ? 'RUNNING' : 'STOPPED'}
              </div>
            </div>

            {/* Shot Clock */}
            <div className="led-display rounded-xl p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">SHOT CLOCK</div>
              <div className={`text-3xl sm:text-4xl font-black clock-font text-center ${
                state.shotClockSeconds <= 5 ? 'text-led-red' : 'text-foreground'
              }`}>
                {formatShotClock()}
              </div>
            </div>

            {/* Possession Arrow */}
            <div className="flex items-center justify-center gap-4">
              <div className={`w-0 h-0 border-t-[15px] border-b-[15px] border-r-[25px] 
                border-t-transparent border-b-transparent transition-all duration-300 ${
                state.possession === 'away' 
                  ? 'border-r-primary opacity-100' 
                  : 'border-r-muted-foreground/30 opacity-30'
              }`} />
              <div className="text-lg font-semibold text-muted-foreground">POSSESSION</div>
              <div className={`w-0 h-0 border-t-[15px] border-b-[15px] border-l-[25px] 
                border-t-transparent border-b-transparent transition-all duration-300 ${
                state.possession === 'home' 
                  ? 'border-l-primary opacity-100' 
                  : 'border-l-muted-foreground/30 opacity-30'
              }`} />
            </div>
          </div>

          {/* Home Team */}
          <div className="text-center">
            <div className="mb-4">
              {state.home.logo && (
                <img
                  src={state.home.logo}
                  alt={`${state.home.name} logo`}
                  className="w-24 h-24 mx-auto mb-4 object-contain"
                />
              )}
              <h2 className="text-xl sm:text-3xl font-bold text-foreground">{state.home.name}</h2>
            </div>
            <div className="led-display rounded-xl p-4 sm:p-6">
              <div className="text-5xl sm:text-8xl font-black clock-font text-center text-foreground">
                {state.home.score}
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-muted-foreground mb-2">FOULS: {state.home.fouls}</div>
              <div className="flex justify-center gap-1">
                {renderTimeoutDots(state.home.timeouts)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Instructions */}
        <div className="text-center text-muted-foreground/60 text-sm">
          Press 'F' for fullscreen
        </div>
      </div>
    </div>
  );
}
