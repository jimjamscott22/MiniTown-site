# MiniTown

MiniTown is a cozy, browser-based city management game built around placing small zones and watching a town become inhabited. It opens on empty grass and keeps every primary action within one gameplay screen.

## Gameplay

- **Explore mode** pans and zooms without placing anything.
- **Zone tools** place Residential, Shop, or Workspace blocks. Press and drag to select a straight run of one to three plots; each drag creates a shared block framed by a single exterior road.
- **Inspector** shows a building's construction state, level, occupants, and current activity on hover or focus.
- **Simulation speed** controls let you pause or run at 1x, 2x, or 4x.

New buildings progress through foundation, framing, and complete stages. Completed homes add residents; completed workplaces and shops add destinations and income. Buildings grow the longer they stay occupied, and residents follow time-based schedules between home, work, and shop destinations.

## Tech stack

- React + TypeScript
- Vite
- Vitest for unit tests

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm test` — run the test suite with Vitest

## Project structure

```
src/
├── App.tsx                 # App shell
├── components/              # HUD, tool rail, inspector, and world rendering
└── game/                    # Grid/placement helpers and the simulation hook
```
