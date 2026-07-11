# MiniTown Design

## Product

MiniTown is a cozy, browser-based city management game built around placing small zones and watching a town become inhabited. It opens on empty grass, teaches itself through compact on-screen hints, and keeps every primary action within one gameplay screen.

## Visual direction

The approved concepts establish a slightly top-down diorama rendered with chunky, pixel-flavored 3D forms. A deep navy management HUD frames warm green terrain by day. At night, the terrain shifts toward blue-violet while windows and streetlights glow amber. Residential, Shop, and Workspace tools use green, coral, and blue accents.

## Interaction

- Explore mode pans and zooms without placing anything.
- Zone tools place Residential, Shop, or Workspace blocks.
- Pressing and dragging selects a straight connected run of one to three plots.
- One drag creates one shared block. A single road frame surrounds its exterior; internal plots never receive roads.
- Hovering or focusing a building opens an inspector with construction state, level, occupants, and current activity.
- Pause, 1x, 2x, and 4x controls change simulation speed.

## Simulation

New buildings progress through foundation, framing, and complete stages. Completed homes add residents; completed workplaces and shops add destinations and income. Buildings grow after remaining occupied. Residents follow readable time-based schedules across home, work, and shop destinations. Lightweight walkers and cars traverse the town continuously.

## Architecture

The prototype uses React and TypeScript. Pure grid/block helpers own drag selection, placement validation, and exterior road geometry. A simulation hook owns clock, resources, construction, growth, and residents. The world view renders the grid and entities; HUD components only emit commands and display derived state.

## Accessibility and resilience

All controls have labels, keyboard focus states, and tooltips. Motion respects reduced-motion preferences. Placement errors are shown inline without losing state. The layout supports desktop and tablet-sized viewports, with mobile using horizontally scrollable tool rails.

