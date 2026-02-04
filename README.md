# Hospital Gungeon

Hospital Gungeon is a top-down action game prototype built with Phaser 3.
This repository is an MVP (Minimum Viable Product): the smallest playable slice
that proves the core loop works (movement, combat, rooms, UI, and progression flow).

## Project developers
- Guillermo Duarte
- Nelson Duarte
- Matias Aguayo
- Katherine Varela
- Eduardo Ovelar

Thanks to the team for their solid work building and integrating the core systems of the project.

## Engine
- Phaser 3 (Arcade Physics)

## How to run
This project is static (no build step). Use a local HTTP server so JSON/assets load correctly.

Option A (Python):
```bash
py -m http.server 8080
```

Option B (Node):
```bash
npx serve .
```

Then open in your browser:
```text
http://localhost:8080
```

## Game flow (current)
Start -> Menu -> Preload -> Narrative -> Hub -> Sector -> Hub -> Boss -> Ending -> Menu

## Current architecture
```
hospital-gungeon/
|
|-- index.html
|-- phaser.js
|-- README.md
|-- public/
|   |-- assets/
|       |-- audio/
|       |-- maps/
|       |-- narrative/
|       |-- sprites/
|-- src/
|   |-- main.js                 # Phaser bootstrap + scene list
|   |-- core/                   # cross-scene orchestration
|   |   |-- EventBus.js
|   |   |-- RunManager.js
|   |   |-- SceneManager.js
|   |-- entities/
|   |   |-- player/
|   |   |   |-- Player.js
|   |   |   |-- PlayerController.js
|   |   |   |-- PlayerStats.js
|   |   |-- enemies/
|   |       |-- EnemyBase.js
|   |       |-- EnemyFactory.js
|   |       |-- types/
|   |           |-- Walker.js
|   |           |-- Shooter.js
|   |           |-- Hybrid.js
|   |-- scenes/
|   |   |-- boot/
|   |   |   |-- PreloadScene.js
|   |   |-- menus/
|   |   |   |-- Start.js
|   |   |   |-- MenuScene.js
|   |   |-- story/
|   |   |   |-- NarrativeScene.js
|   |   |   |-- EndingScene.js
|   |   |-- gameplay/
|   |   |   |-- HubScene.js
|   |   |   |-- SectorScene.js
|   |   |   |-- BossScene.js
|   |   |   |-- sector/
|   |   |       |-- sectorSetup.js
|   |   |       |-- sectorInput.js
|   |   |       |-- sectorRooms.js
|   |   |       |-- sectorEnemies.js
|   |   |       |-- sectorCombat.js
|   |   |       |-- sectorCollisions.js
|   |   |-- ui/
|   |       |-- hud/
|   |       |   |-- HudScene.js
|   |       |-- menus/
|   |           |-- PauseMenu.js
|   |-- systems/
|       |-- ai/
|       |   |-- StateMachine.js
|       |   |-- Behaviors.js
|       |-- maps/
|       |   |-- Map1Builder.js
|       |   |-- Map1Layout.js
|       |-- rooms/
|           |-- DoorSystem.js
|           |-- RoomTemplates.js
|-- docs/
|-- test/
```

## MVP scope
- Core loop: move, shoot, melee, take damage
- Enemies: walker/shooter/hybrid + basic AI behaviors
- Room system: doors, room progression, sector flow
- UI: HUD (health/ammo) + pause menu
- Narrative: intro scene before hub/sector flow

## Notes
- Assets are heavy; use a local server instead of file:// to avoid CORS issues.
- If GitHub UI does not show all assets, use raw links or download the repo ZIP.
