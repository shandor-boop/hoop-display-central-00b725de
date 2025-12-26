# Basketball Scoreboard - V1

A professional, unified basketball scoreboard application that combines display and control functionality in a single interface. Perfect for projecting on screens while controlling from a web browser.

## Features

- **Unified Interface**: Single view that works as both display and controller
- **Real-time Synchronization**: Multiple browser windows/tabs stay in sync automatically using BroadcastChannel API
- **Persistent State**: Game state is saved to localStorage and persists across page refreshes
- **Fullscreen Support**: Press 'F' to toggle fullscreen mode
- **Professional Design**: 
  - Classic LED-style display with Orbitron font
  - Dark theme (#141414 background) with black number boxes
  - Color-coded displays (yellow for time, red for scores, orange for fouls)
  - Fixed-size boxes for consistent layout

## Game Controls

### Game Clock
- **Display**: Large yellow time display (00:00 format)
- **Controls**: 
  - Minutes/Seconds up/down arrows
  - Start/Stop button
  - Buzzer test (requires confirmation: click once for "Sure?", click again to play)

### Team Scores
- **Display**: Large red score displays (supports up to 3 digits)
- **Controls**: +1, +2, +3, -1 buttons
- **Team Names**: Editable text fields above each score

### Fouls
- **Display**: Orange foul count in black boxes (1 digit)
- **Controls**: Up/down arrows next to each foul display

### Period
- **Display**: Large yellow period number (1-4) in black box
- **Controls**: Up/down arrows below the display

### Shot Clock
- **Display**: Yellow shot clock in black box (2 digits)
- **Controls**: 
  - Seconds up/down arrows
  - Quick set buttons (24s, 14s)
  - Start/Stop button
  - Buzzer test (requires confirmation)

### Timeouts
- **Display**: Current timeout count for each team
- **Controls**: Up/down arrows (max 5 timeouts)

### Possession
- **Display**: Arrow indicators showing which team has possession
- **Controls**: Toggle button to switch possession

## Technical Details

### Technology Stack
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Web Audio API** for buzzer sounds
- **BroadcastChannel API** for real-time synchronization
- **localStorage** for state persistence

### State Management
- Custom `useGameState` hook manages all game state
- Automatic synchronization across browser windows/tabs
- State persists to localStorage on every change

### Buzzer Sounds
- Two distinct buzzer sounds:
  - **Game Clock Buzzer**: Lower, longer tone (400Hz, 0.5s)
  - **Shot Clock Buzzer**: Higher, shorter tone (800Hz, 0.2s)
- Buzzer test buttons require confirmation to prevent accidental plays

## Development

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Deployment

The application is configured for GitHub Pages deployment. The build process automatically:
- Builds the application
- Outputs to `dist/` directory
- Configures base path for GitHub Pages

### GitHub Pages Setup
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select "GitHub Actions" as the source
4. The workflow will automatically deploy on push to main branch

## Usage

1. Open the application in a web browser
2. Use the controls to set up your game:
   - Enter team names
   - Set initial scores, fouls, timeouts
   - Set game clock and shot clock
3. Open additional browser windows/tabs for display on projectors/screens
4. All windows will stay synchronized automatically
5. Press 'F' for fullscreen mode on display screens

## Keyboard Shortcuts

- **F**: Toggle fullscreen mode

## Browser Compatibility

- Modern browsers with support for:
  - BroadcastChannel API
  - Web Audio API
  - localStorage
  - Fullscreen API

## Version History

### V1.0.0
- Initial release
- Unified scoreboard interface
- Real-time synchronization
- Persistent state
- Professional LED-style design
- Buzzer sounds with confirmation
- Fullscreen support

## License

This project is open source and available for use.
