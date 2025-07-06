import React, { useRef } from 'react';
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
    const url = `${window.location.origin}${window.location.pathname}#/scoreboard`;
    window.open(url, '_blank', 'fullscreen=yes,menubar=no,toolbar=no,location=no,status=no');
  };

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
        className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-all ${
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
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-scoreboard-frame p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-foreground">Basketball Scoreboard Controller</h1>
          <Button onClick={openScoreboard} variant="score" className="gap-2">
            <ExternalLink className="w-5 h-5" />
            Open Scoreboard
          </Button>
        </div>

        {/* Clock Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Game Clock */}
          <Card className="scoreboard-display">
            <CardHeader>
              <CardTitle className="text-center">Game Clock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="led-display rounded-lg p-6 mb-4">
                  <div className="text-5xl font-black clock-font">{formatGameClock()}</div>
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    variant={state.gameClockRunning ? "destructive" : "score"}
                    onClick={() => dispatch({ 
                      type: state.gameClockRunning ? 'STOP_GAME_CLOCK' : 'START_GAME_CLOCK' 
                    })}
                    className="gap-2"
                  >
                    {state.gameClockRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {state.gameClockRunning ? 'Stop' : 'Start'}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-muted-foreground">Minutes</label>
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
                    className="led-display"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Seconds</label>
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
                    className="led-display"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shot Clock */}
          <Card className="scoreboard-display">
            <CardHeader>
              <CardTitle className="text-center">Shot Clock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="led-display rounded-lg p-6 mb-4">
                  <div className={`text-5xl font-black clock-font ${
                    state.shotClockSeconds <= 5 ? 'text-led-red' : ''
                  }`}>
                    {formatShotClock()}
                  </div>
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    variant={state.shotClockRunning ? "destructive" : "score"}
                    onClick={() => dispatch({ 
                      type: state.shotClockRunning ? 'STOP_SHOT_CLOCK' : 'START_SHOT_CLOCK' 
                    })}
                    className="gap-2"
                  >
                    {state.shotClockRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {state.shotClockRunning ? 'Stop' : 'Start'}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="control"
                  onClick={() => dispatch({ type: 'RESET_SHOT_CLOCK', seconds: 24 })}
                >
                  24s
                </Button>
                <Button
                  variant="control"
                  onClick={() => dispatch({ type: 'RESET_SHOT_CLOCK', seconds: 14 })}
                >
                  14s
                </Button>
                <Button
                  variant="control"
                  onClick={() => dispatch({ type: 'RESET_SHOT_CLOCK', seconds: 0 })}
                >
                  0s
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period and Possession */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="scoreboard-display">
            <CardHeader>
              <CardTitle className="text-center">Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="led-display rounded-lg p-6">
                  <div className="text-5xl font-black clock-font">{state.period}</div>
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    variant="control"
                    onClick={() => dispatch({ type: 'UPDATE_PERIOD', value: state.period - 1 })}
                  >
                    -
                  </Button>
                  <Button
                    variant="control"
                    onClick={() => dispatch({ type: 'UPDATE_PERIOD', value: state.period + 1 })}
                  >
                    +
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="scoreboard-display">
            <CardHeader>
              <CardTitle className="text-center">Possession</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="led-display rounded-lg p-6">
                  <div className="text-2xl font-bold">
                    {state.possession === 'home' ? state.home.name : state.away.name}
                  </div>
                </div>
                <Button
                  variant="possession"
                  onClick={() => dispatch({ type: 'TOGGLE_POSSESSION' })}
                  className="w-full"
                >
                  Toggle Possession
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Away Team */}
          <Card className="scoreboard-display">
            <CardHeader>
              <CardTitle className="text-center">Away Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Team Name</label>
                <Input
                  value={state.away.name}
                  onChange={(e) => dispatch({
                    type: 'UPDATE_TEAM',
                    team: 'away',
                    field: 'name',
                    value: e.target.value
                  })}
                  className="led-display"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Logo</label>
                <div className="flex gap-2 items-center">
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
                  >
                    Upload Logo
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
                    >
                      Remove
                    </Button>
                  )}
                </div>
                {state.away.logo && (
                  <img src={state.away.logo} alt="Away logo" className="w-16 h-16 mt-2 object-contain" />
                )}
              </div>

              <div className="led-display rounded-lg p-4 text-center">
                <div className="text-4xl font-black clock-font mb-2">{state.away.score}</div>
                <div className="flex justify-center gap-2 flex-wrap">
                  <Button variant="score" onClick={() => dispatch({ type: 'UPDATE_SCORE', team: 'away', points: 1 })}>+1</Button>
                  <Button variant="score" onClick={() => dispatch({ type: 'UPDATE_SCORE', team: 'away', points: 2 })}>+2</Button>
                  <Button variant="score" onClick={() => dispatch({ type: 'UPDATE_SCORE', team: 'away', points: 3 })}>+3</Button>
                  <Button variant="destructive" onClick={() => dispatch({ type: 'UPDATE_SCORE', team: 'away', points: -1 })}>-1</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Fouls</label>
                  <div className="flex gap-2 items-center">
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
                      className="led-display"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Timeouts</label>
                  <div className="flex gap-1 mt-2">
                    {renderTimeoutDots('away')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Home Team */}
          <Card className="scoreboard-display">
            <CardHeader>
              <CardTitle className="text-center">Home Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Team Name</label>
                <Input
                  value={state.home.name}
                  onChange={(e) => dispatch({
                    type: 'UPDATE_TEAM',
                    team: 'home',
                    field: 'name',
                    value: e.target.value
                  })}
                  className="led-display"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Logo</label>
                <div className="flex gap-2 items-center">
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
                  >
                    Upload Logo
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
                    >
                      Remove
                    </Button>
                  )}
                </div>
                {state.home.logo && (
                  <img src={state.home.logo} alt="Home logo" className="w-16 h-16 mt-2 object-contain" />
                )}
              </div>

              <div className="led-display rounded-lg p-4 text-center">
                <div className="text-4xl font-black clock-font mb-2">{state.home.score}</div>
                <div className="flex justify-center gap-2 flex-wrap">
                  <Button variant="score" onClick={() => dispatch({ type: 'UPDATE_SCORE', team: 'home', points: 1 })}>+1</Button>
                  <Button variant="score" onClick={() => dispatch({ type: 'UPDATE_SCORE', team: 'home', points: 2 })}>+2</Button>
                  <Button variant="score" onClick={() => dispatch({ type: 'UPDATE_SCORE', team: 'home', points: 3 })}>+3</Button>
                  <Button variant="destructive" onClick={() => dispatch({ type: 'UPDATE_SCORE', team: 'home', points: -1 })}>-1</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Fouls</label>
                  <div className="flex gap-2 items-center">
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
                      className="led-display"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Timeouts</label>
                  <div className="flex gap-1 mt-2">
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