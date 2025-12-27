import { Scoreboard } from './components/Scoreboard';
import { ScoreboardDisplay } from './components/ScoreboardDisplay';
import './index.css';

function App() {
  // Check if we're in display mode via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const isDisplayMode = urlParams.get('display') === 'true';

  if (isDisplayMode) {
    return <ScoreboardDisplay />;
  }

  return <Scoreboard />;
}

export default App;
