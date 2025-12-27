import { useGameState } from '../hooks/useGameState';

export function ScoreboardDisplay() {
  const {
    state,
    formatGameClock,
    formatShotClock,
  } = useGameState();

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
          </div>
        </div>

        {/* Middle Section: Scores, Fouls, Period */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-2 sm:mb-4 md:mb-6">
          {/* Left: Home Score and Fouls */}
          <div className="text-center flex flex-col items-center">
            <div className="text-[clamp(1rem,3vw,1.875rem)] font-bold text-white uppercase mb-1 sm:mb-2 w-full">
              {state.home.name}
            </div>
            <div className="border-2 border-white bg-black px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 mb-2 sm:mb-3 md:mb-4 w-full">
              <div className="text-[clamp(2.5rem,8vw,8rem)] font-black clock-font text-red-500 text-center leading-none">
                {state.home.score}
              </div>
            </div>
            <div className="mb-1 sm:mb-2">
              <div className="text-[clamp(0.625rem,1.5vw,0.875rem)] text-white mb-0.5 sm:mb-1 uppercase font-bold">FOULS</div>
              <div className="inline-flex items-center justify-center">
                <div className="bg-black border-2 border-white text-orange-500 text-[clamp(1.25rem,3vw,1.5rem)] font-black clock-font px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-2 min-w-[clamp(2.5rem,6vw,3.75rem)] text-center">
                  {state.home.fouls}
                </div>
              </div>
            </div>
            <div className="mt-1 sm:mt-2">
              <div className="text-[clamp(0.625rem,1.5vw,0.75rem)] text-white mb-0.5 sm:mb-1 font-bold">Timeouts: {state.home.timeouts}</div>
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
            </div>
            <div className="mb-2 sm:mb-3 md:mb-4">
              <div className="text-[clamp(0.625rem,1.5vw,0.75rem)] text-white mb-1 sm:mb-2 uppercase font-bold">Shot Clock</div>
              <div className={`inline-block border-2 border-white bg-black px-2 sm:px-3 md:px-4 py-1 sm:py-2 mb-1 sm:mb-2 w-full max-w-[clamp(4.5rem,14vw,8.75rem)] ${!state.shotClockEnabled ? 'opacity-50' : ''}`}>
                <div className={`text-[clamp(1.5rem,5vw,4rem)] font-black clock-font text-center leading-none ${state.shotClockEnabled ? 'text-yellow-500' : 'text-gray-500'}`}>
                  {state.shotClockEnabled ? formatShotClock() : '--'}
                </div>
              </div>
            </div>
            <div className="mt-2 sm:mt-3 md:mt-4">
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <div
                  className={`w-0 h-0 border-t-[clamp(0.5rem,1.5vw,0.75rem)] border-b-[clamp(0.5rem,1.5vw,0.75rem)] border-r-[clamp(0.8rem,2.5vw,1.25rem)] 
                    border-t-transparent border-b-transparent transition-all ${
                    state.possession === 'away'
                      ? 'border-r-yellow-500 opacity-100'
                      : 'border-r-white opacity-30'
                  }`}
                />
                <div
                  className={`w-0 h-0 border-t-[clamp(0.5rem,1.5vw,0.75rem)] border-b-[clamp(0.5rem,1.5vw,0.75rem)] border-l-[clamp(0.8rem,2.5vw,1.25rem)] 
                    border-t-transparent border-b-transparent transition-all ${
                    state.possession === 'home'
                      ? 'border-l-yellow-500 opacity-100'
                      : 'border-l-white opacity-30'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Right: Away Score and Fouls */}
          <div className="text-center flex flex-col items-center">
            <div className="text-[clamp(1rem,3vw,1.875rem)] font-bold text-white uppercase mb-1 sm:mb-2 w-full">
              {state.away.name}
            </div>
            <div className="border-2 border-white bg-black px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 mb-2 sm:mb-3 md:mb-4 w-full">
              <div className="text-[clamp(2.5rem,8vw,8rem)] font-black clock-font text-red-500 text-center leading-none">
                {state.away.score}
              </div>
            </div>
            <div className="mb-1 sm:mb-2">
              <div className="text-[clamp(0.625rem,1.5vw,0.875rem)] text-white mb-0.5 sm:mb-1 uppercase font-bold">FOULS</div>
              <div className="inline-flex items-center justify-center">
                <div className="bg-black border-2 border-white text-orange-500 text-[clamp(1.25rem,3vw,1.5rem)] font-black clock-font px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-2 min-w-[clamp(2.5rem,6vw,3.75rem)] text-center">
                  {state.away.fouls}
                </div>
              </div>
            </div>
            <div className="mt-1 sm:mt-2">
              <div className="text-[clamp(0.625rem,1.5vw,0.75rem)] text-white mb-0.5 sm:mb-1 font-bold">Timeouts: {state.away.timeouts}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

