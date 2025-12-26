import React, { useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Play, Pause, Volume2, VolumeX } from 'lucide-react';

export function UnifiedScoreboard() {
  const { state, dispatch, formatGameClock, formatShotClock } = useGame();

  // Fullscreen toggle with 'F' key
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

  const renderFoulIndicators = (fouls: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-4 h-4 rounded-full border-2 transition-all ${
          i < fouls
            ? 'bg-destructive border-destructive'
            : 'bg-transparent border-muted-foreground/30'
        }`}
      />
    ));
  };

  const renderTimeoutIndicators = (timeouts: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-3 h-3 rounded-full border-2 transition-all ${
          i < timeouts
            ? 'bg-primary border-primary'
            : 'bg-transparent border-muted-foreground/30'
        }`}
      />
    ));
  };

  const adjustGameClock = (minutes: number, seconds: number) => {
    const newMinutes = Math.max(0, Math.min(99, state.gameClockMinutes + minutes));
    const newSeconds = Math.max(0, Math.min(59, state.gameClockSeconds + seconds));
    dispatch({
      type: 'UPDATE_GAME_CLOCK',
      minutes: newMinutes,
      seconds: newSeconds,
    });
  };

  const adjustScore = (team: 'home' | 'away', points: number) => {
    dispatch({ type: 'UPDATE_SCORE', team, points });
  };

  const adjustFouls = (team: 'home' | 'away', change: number) => {
    const newFouls = Math.max(0, state[team].fouls + change);
    dispatch({
      type: 'UPDATE_TEAM',
      team,
      field: 'fouls',
      value: newFouls,
    });
  };

  const adjustTimeouts = (team: 'home' | 'away', change: number) => {
    const newTimeouts = Math.max(0, Math.min(5, state[team].timeouts + change));
    dispatch({
      type: 'UPDATE_TEAM',
      team,
      field: 'timeouts',
      value: newTimeouts,
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        {/* Top Section: Game Clock and Fouls */}
        <div className="mb-6">
          {/* Game Clock */}
          <div className="led-display rounded-xl p-6 mb-4">
            <div className="text-center">
              <div className="text-7xl sm:text-9xl font-black clock-font text-led-green mb-4">
                {formatGameClock()}
              </div>
              
              {/* Clock Controls */}
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="flex flex-col items-center gap-1">
                  <label className="text-xs text-muted-foreground uppercase">Minutes</label>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustGameClock(1, 0)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustGameClock(-1, 0)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Button
                  variant={state.gameClockRunning ? "destructive" : "default"}
                  size="lg"
                  onClick={() => dispatch({
                    type: state.gameClockRunning ? 'STOP_GAME_CLOCK' : 'START_GAME_CLOCK'
                  })}
                  className="mx-4"
                >
                  {state.gameClockRunning ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Start
                    </>
                  )}
                </Button>
                
                <div className="flex flex-col items-center gap-1">
                  <label className="text-xs text-muted-foreground uppercase">Seconds</label>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustGameClock(0, 1)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustGameClock(0, -1)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fouls Display */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2 uppercase">Away Fouls</div>
              <div className="flex justify-center gap-1 mb-2">
                {renderFoulIndicators(state.away.fouls)}
              </div>
              <div className="flex gap-1 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustFouls('away', -1)}
                  className="h-7 w-7 p-0"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustFouls('away', 1)}
                  className="h-7 w-7 p-0"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2 uppercase">Period</div>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4].map((period) => (
                  <Button
                    key={period}
                    variant={state.period === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => dispatch({ type: 'UPDATE_PERIOD', value: period })}
                    className="h-8 w-8 p-0"
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2 uppercase">Home Fouls</div>
              <div className="flex justify-center gap-1 mb-2">
                {renderFoulIndicators(state.home.fouls)}
              </div>
              <div className="flex gap-1 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustFouls('home', -1)}
                  className="h-7 w-7 p-0"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustFouls('home', 1)}
                  className="h-7 w-7 p-0"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Scoreboard Section */}
        <div className="led-display rounded-xl p-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Away Team */}
            <div className="text-center">
              <input
                type="text"
                value={state.away.name}
                onChange={(e) => dispatch({
                  type: 'UPDATE_TEAM',
                  team: 'away',
                  field: 'name',
                  value: e.target.value
                })}
                className="text-4xl font-bold text-foreground mb-6 bg-transparent border-none text-center focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 cursor-text w-full"
                placeholder="AWAY"
              />
              
              {/* Score Display */}
              <div className="text-8xl sm:text-9xl font-black clock-font text-led-green mb-6">
                {state.away.score.toString().padStart(2, '0')}
              </div>
              
              {/* Score Controls */}
              <div className="flex justify-center gap-2 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustScore('away', 1)}
                  className="h-8"
                >
                  +1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustScore('away', 2)}
                  className="h-8"
                >
                  +2
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustScore('away', 3)}
                  className="h-8"
                >
                  +3
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustScore('away', -1)}
                  className="h-8"
                >
                  -1
                </Button>
              </div>

              {/* Timeouts */}
              <div className="text-sm text-muted-foreground mb-2 uppercase">Timeouts</div>
              <div className="flex justify-center gap-1 mb-2">
                {renderTimeoutIndicators(state.away.timeouts)}
              </div>
              <div className="flex gap-1 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustTimeouts('away', -1)}
                  className="h-7 w-7 p-0"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustTimeouts('away', 1)}
                  className="h-7 w-7 p-0"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Center: Possession and Shot Clock */}
            <div className="text-center space-y-6">
              {/* Possession Indicator */}
              <div>
                <div className="text-sm text-muted-foreground mb-3 uppercase">Possession</div>
                <div className="flex items-center justify-center gap-4">
                  <div
                    className={`w-0 h-0 border-t-[20px] border-b-[20px] border-r-[30px] 
                      border-t-transparent border-b-transparent transition-all duration-300 cursor-pointer ${
                      state.possession === 'away'
                        ? 'border-r-primary opacity-100'
                        : 'border-r-muted-foreground/30 opacity-30'
                    }`}
                    onClick={() => dispatch({ type: 'TOGGLE_POSSESSION' })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch({ type: 'TOGGLE_POSSESSION' })}
                    className="uppercase"
                  >
                    Toggle
                  </Button>
                  <div
                    className={`w-0 h-0 border-t-[20px] border-b-[20px] border-l-[30px] 
                      border-t-transparent border-b-transparent transition-all duration-300 cursor-pointer ${
                      state.possession === 'home'
                        ? 'border-l-primary opacity-100'
                        : 'border-l-muted-foreground/30 opacity-30'
                    }`}
                    onClick={() => dispatch({ type: 'TOGGLE_POSSESSION' })}
                  />
                </div>
              </div>

              {/* Shot Clock */}
              <div className="led-display rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-2 uppercase">Shot Clock</div>
                <div className={`text-5xl font-black clock-font ${
                  state.shotClockSeconds <= 5 ? 'text-led-red' : 'text-led-green'
                }`}>
                  {formatShotClock()}
                </div>
                <div className="flex justify-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch({ type: 'RESET_SHOT_CLOCK', seconds: 24 })}
                    className="text-xs"
                  >
                    24s
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch({ type: 'RESET_SHOT_CLOCK', seconds: 14 })}
                    className="text-xs"
                  >
                    14s
                  </Button>
                  <Button
                    variant={state.shotClockRunning ? "destructive" : "default"}
                    size="sm"
                    onClick={() => dispatch({
                      type: state.shotClockRunning ? 'STOP_SHOT_CLOCK' : 'START_SHOT_CLOCK'
                    })}
                    className="text-xs"
                  >
                    {state.shotClockRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              {/* Buzzer Control */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant={state.gameBuzzerEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => dispatch({ type: 'TOGGLE_BUZZER', buzzer: 'game' })}
                  className="uppercase"
                >
                  {state.gameBuzzerEnabled ? (
                    <>
                      <Volume2 className="h-4 w-4 mr-2" />
                      Buzzer On
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4 mr-2" />
                      Buzzer Off
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Home Team */}
            <div className="text-center">
              <input
                type="text"
                value={state.home.name}
                onChange={(e) => dispatch({
                  type: 'UPDATE_TEAM',
                  team: 'home',
                  field: 'name',
                  value: e.target.value
                })}
                className="text-4xl font-bold text-foreground mb-6 bg-transparent border-none text-center focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 cursor-text w-full"
                placeholder="HOME"
              />
              
              {/* Score Display */}
              <div className="text-8xl sm:text-9xl font-black clock-font text-led-green mb-6">
                {state.home.score.toString().padStart(2, '0')}
              </div>
              
              {/* Score Controls */}
              <div className="flex justify-center gap-2 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustScore('home', 1)}
                  className="h-8"
                >
                  +1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustScore('home', 2)}
                  className="h-8"
                >
                  +2
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustScore('home', 3)}
                  className="h-8"
                >
                  +3
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustScore('home', -1)}
                  className="h-8"
                >
                  -1
                </Button>
              </div>

              {/* Timeouts */}
              <div className="text-sm text-muted-foreground mb-2 uppercase">Timeouts</div>
              <div className="flex justify-center gap-1 mb-2">
                {renderTimeoutIndicators(state.home.timeouts)}
              </div>
              <div className="flex gap-1 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustTimeouts('home', -1)}
                  className="h-7 w-7 p-0"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustTimeouts('home', 1)}
                  className="h-7 w-7 p-0"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Instructions */}
        <div className="text-center text-muted-foreground/60 text-xs mt-4">
          Press 'F' for fullscreen
        </div>
      </div>
    </div>
  );
}

