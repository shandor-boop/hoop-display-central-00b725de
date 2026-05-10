# AGENTS.md

## Cursor Cloud specific instructions

This is a single-page React + TypeScript basketball scoreboard app built with Vite. No backend, database, or external services are required.

### Key commands

See `package.json` scripts for standard commands:
- `npm run dev` — starts Vite dev server on port 8080
- `npm run build` — production build to `dist/`
- `npm run lint` — ESLint
- `npm run preview` — preview production build

### Dev server

The Vite dev server runs at `http://localhost:8080/hoop-display-central-00b725de/` (note the base path configured in `vite.config.ts`). The server binds to `::` (all interfaces).

### Linting

ESLint has 2 pre-existing errors and 7 warnings in shadcn/ui components (`src/components/ui/`). These are not regressions — they come from auto-generated shadcn component code.

### No test framework

There is no test runner or test suite configured in this project. There is no `test` script in `package.json`.
