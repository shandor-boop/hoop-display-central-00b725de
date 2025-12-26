import React, { useRef, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, ExternalLink } from 'lucide-react';

export function ControllerView() {
  const { state, dispatch, formatGameClock, formatShotClock } = useGame();
  const homeLogoInputRef = useRef<HTMLInputElement>(null);
  const awayLogoInputRef = useRef<HTMLInputElement>(null);

  const openScoreboard = () => {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
    const url = `${window.location.origin}${basePath}/scoreboard`;
    window.open(url, '_blank', 'fullscreen=yes,menubar=no,toolbar=no,location=no,status=no');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          // Toggle game clock
          dispatch({ 
            type: state.gameClockRunning ? 'STOP_GAME_CLOCK' : 'START_GAME_CLOCK' 
          });
          break;
        case 's':
          e.preventDefault();
          // Toggle shot clock
          dispatch({ 
            type: state.shotClockRunning ? 'STOP_SHOT_CLOCK' : 'START_SHOT_CLOCK' 
          });
          break;
        case 'r':
          e.preventDefault();
          // Reset shot clock to 24
          dispatch({ type: 'RESET_SHOT_CLOCK', seconds: 24 });
          break;
        case 'p':
          e.preventDefault();
          // Toggle possession
          dispatch({ type: 'TOGGLE_POSSESSION' });
          break;
        case '1':
          e.preventDefault();
          // Home team +1
          dispatch({ type: 'UPDATE_SCORE', team: 'home', points: 1 });
          break;
        case '2':
          e.preventDefault();
          // Home team +2
          dispatch({ type: 'UPDATE_SCORE', team: 'home', points: 2 });
          break;
        case '3':
          e.preventDefault();
          // Home team +3
          dispatch({ type: 'UPDATE_SCORE', team: 'home', points: 3 });
          break;
        case 'q':
          e.preventDefault();
          // Away team +1
          dispatch({ type: 'UPDATE_SCORE', team: 'away', points: 1 });
          break;
        case 'w':
          e.preventDefault();
          // Away team +2
          dispatch({ type: 'UPDATE_SCORE', team: 'away', points: 2 });
          break;
        case 'e':
          e.preventDefault();
          // Away team +3
          dispatch({ type: 'UPDATE_SCORE', team: 'away', points: 3 });
          break;
        case 'o':
          e.preventDefault();
          // Open scoreboard
          openScoreboard();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.gameClockRunning, state.shotClockRunning, dispatch]);

  const handleLogoUpload = (team: 'home' | 'away', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      dispatch({ type: 'UPDATE_TEAM', team, field: 'logo', value: result });
    };
    reader.readAsDataURL(file);
  };

  const renderTimeoutDots = (team: 'home' | 'away') => {
    const timeouts = state[team].timeouts;
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-3 h-3 rounded-full border-2 cursor-pointer transition-all ${
          i < timeouts
            ? 'bg-primary border-primary'
            : 'bg-transparent border-muted-foreground/30 hover:border-muted-foreground'
        }`}
        onClick={() => {
          const newTimeouts = i < timeouts ? i : i + 1;
          dispatch({ type: 'UPDATE_TEAM', team, field: 'timeouts', value: newTimeouts });
        }}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-scoreboard-frame p-3">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Basketball Scoreboard Controller</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Keyboard shortcuts: Space (game clock), S (shot clock), R (reset shot), P (possession), 
              1/2/3 (home score), Q/W/E (away score), O (open scoreboard)
            </p>
          </div>
          <Button onClick={openScoreboard} variant="score" className="gap-2 h-9 px-4 text-sm w-full sm:w-auto">
            <ExternalLink className="w-4 h-4" />
            Open Scoreboard
          </Button>
        </div>

        {/* Clock Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Game Clock */}
          <Card className="scoreboard-display">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-base">Game Clock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-center">
                <div className="led-display rounded-lg p-3 mb-2">
                  <div className="text-3xl font-black clock-font">{formatGameClock()}</div>
                </div>
                <Button
                  variant={state.gameClockRunning ? "destructive" : "score"}
                  onClick={() => dispatch({ 
                    type: state.gameClockRunning ? 'STOP_GAME_CLOCK' : 'START_GAME_CLOCK' 
                  })}
                  className="gap-1 h-8 px-3 text-xs"
                >
                  {state.gameClockRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {state.gameClockRunning ? 'Stop' : 'Start'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="text-xs text-muted-foreground">Min</label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={state.gameClockMinutes}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_GAME_CLOCK',
                      minutes: parseInt(e.target.value) || 0,
                      seconds: state.gameClockSeconds
                    })}
                    className="led-display text-xs h-7"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Sec</label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={state.gameClockSeconds}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_GAME_CLOCK',
                      minutes: state.gameClockMinutes,
                      seconds: parseInt(e.target.value) || 0
                    })}
                    className="led-display text-xs h-7"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shot Clock */}
          <Card className="scoreboard-display">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-base">Shot Clock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-center">
                <div className="led-display rounded-lg p-3 mb-2">
                  <div className={`text-3xl font-black clock-font ${
                    state.shotClockSeconds <= 5 ? 'text-led-red' : ''
                  }`}>
                    {formatShotClock()}
                  </div>
                </div>
                <Button
                  variant={state.shotClockRunning ? "destructive" : "score"}
                  onClick={() => dispatch({ 
                    type: state.shotClockRunning ? 'STOP_SHOT_CLOCK' : 'START_SHOT_CLOCK' 
                  })}
                  className="gap-1 h-8 px-3 text-xs"
                >
                  {state.shotClockRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {state.shotClockRunning ? 'Stop' : 'Start'}
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <Button
                  variant="control"
                  onClick={() => dispatch({ type: 'RESET_SHOT_CLOCK', seconds: 24 })}
                  className="text-xs px-1 py-1 h-7"
                >
                  24s
                </Button>
                <Button
                  variant="control"
                  onClick={() => dispatch({ type: 'RESET_SHOT_CLOCK', seconds: 14 })}
                  className="text-xs px-1 py-1 h-7"
                >
                  14s
                </Button>
                <Button
                  variant="control"
                  onClick={() => dispatch({ type: 'RESET_SHOT_CLOCK', seconds: 0 })}
                  className="text-xs px-1 py-1 h-7"
                >
                  0s
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Period */}
          <Card className="scoreboard-display">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-base">Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="led-display rounded-lg p-3">
                  <div className="text-3xl font-black clock-font">{state.period}</div>
                </div>
                <div className="flex justify-center gap-1">
                  <Button
                    variant="control"
                    onClick={() => dispatch({ type: 'UPDATE_PERIOD', value: state.period - 1 })}
                    className="text-xs px-2 py-1 h-7"
                  >
                    -
                  </Button>
                  <Button
                    variant="control"
                    onClick={() => dispatch({ type: 'UPDATE_PERIOD', value: state.period + 1 })}
                    className="text-xs px-2 py-1 h-7"
                  >
                    +
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Possession */}
          <Card className="scoreboard-display">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-base">Possession</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="led-display rounded-lg p-3">
                  <div className="text-sm font-bold">
                    {state.possession === 'home' ? state.home.name : state.away.name}
                  </div>
                </div>
                <Button
                  variant="possession"
                  onClick={() => dispatch({ type: 'TOGGLE_POSSESSION' })}
                  className="w-full text-xs px-2 py-1 h-7"
                >
                  Toggle
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Away Team */}
          <Card className="scoreboard-display">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-base">Away Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Team Name</label>
                  <Input
                    value={state.away.name}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_TEAM',
                      team: 'away',
                      field: 'name',
                      value: e.target.value
                    })}
                    className="led-display text-xs h-7"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Logo</label>
                  <div className="flex gap-1">
                    <input
                      type="file"
                      accept="image/*"
                      ref={awayLogoInputRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload('away', file);
                      }}
                    />
                    <Button
                      variant="control"
                      onClick={() => awayLogoInputRef.current?.click()}
                      className="text-xs px-2 py-1 h-7 flex-1"
                    >
                      Upload
                    </Button>
                    {state.away.logo && (
                      <Button
                        variant="destructive"
                        onClick={() => dispatch({
                          type: 'UPDATE_TEAM',
                          team: 'away',
                          field: 'logo',
                          value: undefined
                        })}
                        className="text-xs px-2 py-1 h-7"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {state.away.logo && (
                <div className="flex justify-center">
                  <img src={state.away.logo} alt="Away logo" className="w-10 h-10 object-contain" />
                </div>
              )}

              <div className="led-display rounded-lg p-2 text-center">
                <div className="text-2xl font-black clock-font mb-1">{state.away.score}</div>
                <div className="flex justify-center gap-1">
                  <Button variant="score" onClick={() => dispatch({ type: 'UPDATE_SCORE', team: 'away', points: 1 })} className="text-xs px-2 py-1 h-6">+1</Button>
                  <Button variant="score" onClick={() => dispatch({ type: 'UPDATE_SCORE', team: 'away', points: 2 })} className="text-xs px-2 py-1 h-6">+2</Button>
                  <Button variant="score" onClick={() => dispatch({ type: 'UPDATE_SCORE', team: 'away', points: 3 })} className="text-xs px-2 py-1 h-6">+3</Button>
                  <Button variant="destructive" onClick={() => dispatch({ type: 'UPDATE_SCORE', team: 'away', points: -1 })} className="text-xs px-2 py-1 h-6">-1</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Fouls</label>
                  <Input
                    type="number"
                    min="0"
                    value={state.away.fouls}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_TEAM',
                      team: 'away',
                      field: 'fouls',
                      value: parseInt(e.target.value) || 0
                    })}
                    className="led-display text-xs h-7"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Timeouts</label>
                  <div className="flex gap-1 mt-1">
                    {renderTimeoutDots('away')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Home Team */}
          <Card className="scoreboard-display">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-base">Home Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Team Name</label>
                  <Input
                    value={state.home.name}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_TEAM',
                      team: 'home',
                      field: 'name',
                      value: e.target.value
                    })}
                    className="led-display text-xs h-7"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Logo</label>
                  <div className="flex gap-1">
                    <input
                      type="file"
                      accept="image/*"
                      ref={homeLogoInputRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload('home', file);
                      }}
                    />
                    <Button
                      variant="control"
                      onClick={() => homeLogoInputRef.current?.click()}
                      className="text-xs px-2 py-1 h-7 flex-1"
                    >
                      Upload
                    </Button>
                    {state.home.logo && (
                      <Button
                        variant="destructive"
                        onClick={() => dispatch({
                          type: 'UPDATE_TEAM',
                          team: 'home',
                          field: 'logo',
                          value: undefined
                        })}
                        className="text-xs px-2 py-1 h-7"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {state.home.logo && (
                <div className="flex justify-center">
                  <img src={state.home.logo} alt="Home logo" className="w-10 h-10 object-contain" />
                </div>
              )}

              <div className="led-display rounded-lg p-2 text-center">
                <div className="text-2xl font-black clock-font mb-1">{state.home.score}</div>
                <div className="flex justify-center gap-1">
                  <Button variant="score" onClick={() => dispatch({ type: 'UPDATE_SCORE', team: 'home', points: 1 })} className="text-xs px-2 py-1 h-6">+1</Button>
                  <Button variant="score" onClick={() => dispatch({ type: 'UPDATE_SCORE', team: 'home', points: 2 })} className="text-xs px-2 py-1 h-6">+2</Button>
                  <Button variant="score" onClick={() => dispatch({ type: 'UPDATE_SCORE', team: 'home', points: 3 })} className="text-xs px-2 py-1 h-6">+3</Button>
                  <Button variant="destructive" onClick={() => dispatch({ type: 'UPDATE_SCORE', team: 'home', points: -1 })} className="text-xs px-2 py-1 h-6">-1</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Fouls</label>
                  <Input
                    type="number"
                    min="0"
                    value={state.home.fouls}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_TEAM',
                      team: 'home',
                      field: 'fouls',
                      value: parseInt(e.target.value) || 0
                    })}
                    className="led-display text-xs h-7"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Timeouts</label>
                  <div className="flex gap-1 mt-1">
                    {renderTimeoutDots('home')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}