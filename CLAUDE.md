# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MiniTown is a cozy, browser-based city management game (React + TypeScript + Vite). Players place Residential/Shop/Workspace zone blocks on a grid; buildings progress through construction stages, residents follow a simulated daily schedule, and the town accrues money/population/happiness over time. There is no backend — all state lives in React state plus `localStorage` for persistence.

## Development Commands

- `npm install` — install dependencies
- `npm run dev` — start the Vite dev server (bound to `0.0.0.0`)
- `npm run build` — type-check (`tsc -b`) then build for production
- `npm test` — run the Vitest suite once (runs in watch mode if invoked directly via `vitest`)
- `npx vitest run src/game/grid.test.ts` — run a single test file
- `npx vitest run -t "test name"` — run tests matching a name

There is no lint script configured (no ESLint/Prettier config in the repo) — rely on `tsc -b` (via `npm run build`) for type safety.

## Architecture

All game logic is deliberately kept out of components, in `src/game/`:

- **`game/types.ts`** — core domain types (`ZoneType`, `Block`, `Building`, `Resident`, `TownResources`). `Block` is what the player places (a run of 1-3 grid cells sharing one zone); `Building` is the per-cell derived render/sim unit generated from a block.
- **`game/grid.ts`** — pure geometry helpers: drag-to-cells conversion (`getDragCells`, clamped to a max run of 3), placement validity (`canPlaceBlock`), and bounding-box math (`getBlockBounds`) used to draw the single shared exterior road/frame around a block.
- **`game/simulation.ts`** — pure functions deriving simulated values from elapsed time: construction stage progression (`getBuildingStage`), building growth/leveling (`levelForAge`, `happinessGrowthMultiplier`), town-wide happiness and income formulas, and per-resident/per-building activity/position labels used for rendering walkers (`getWalkerPosition`).
- **`game/goals.ts`** — declarative milestone list (`TOWN_GOALS`) with `check` predicates over a `GoalSnapshot`; `getNextGoal`/`detectCompletedGoals` drive the goal banner and money rewards.
- **`game/persistence.ts`** — thin `localStorage` wrapper (`SAVE_KEY = 'minitown-save-v1'`) for save/load/clear; all failures are swallowed (private-browsing safe).
- **`game/useTownSimulation.ts`** — the central hook and single source of truth for game state. It owns the raw `blocks`/`elapsed`/`gameMinutes`/`money`/`speed`/`completedGoals` state, derives `buildings`/`residents`/`happiness`/`income` from it every render via `useMemo`, drives the game clock with a `requestAnimationFrame` loop (elapsed time and money accrue by `speed`), periodically autosaves (interval + `beforeunload`), and detects newly-completed goals to fire `goalEvent` rewards. Exposes actions: `placeBlock`, `demolishAtCell`, `setSpeed`, `togglePause`, `resetTown`, `continueSavedTown`, `dismissSavedTown`.

Everything above is pure/deterministic given `(blocks, elapsed, happiness, completedGoals, ...)` — this is why nearly all of it is unit-testable without rendering React (see `*.test.ts` files colocated in `src/game/`).

`src/App.tsx` is the composition root: it calls `useTownSimulation()` once, tracks only UI-local state (`tool`, `zoom`, `inspectedId`, transient `notice` text), and wires the hook's data/actions into presentational components:

- `TownWorld` — the grid/canvas surface; owns drag-to-place and click-to-bulldoze interaction, calls `placeBlock`/`demolishAtCell`/`onInspect`/`onZoom`.
- `WorldEntities` / `Building` — rendering of buildings and walking residents on the grid.
- `TopHud`, `ToolRail`, `SpeedControls`, `Inspector`, `ResumeBanner` — HUD chrome, tool selection, speed/pause controls, per-building inspector panel, and the "resume saved town?" prompt shown when `pendingRestore` is set on load.

When changing gameplay rules (economy, growth, goals), prefer editing the pure functions in `src/game/` and their tests over touching components — the components should stay dumb renderers of hook output.

## Notes

- `dist/` and `generated_images/` are build/asset output, not source — don't hand-edit `dist/`.
- No test framework config beyond Vitest defaults; tests are colocated next to the modules they cover (`foo.ts` + `foo.test.ts`).
