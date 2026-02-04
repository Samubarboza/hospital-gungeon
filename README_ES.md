# Hospital Gungeon
[Read this README in English](README.md)

Hospital Gungeon es un prototipo de juego de accion top-down construido con Phaser 3.
Este repositorio es un MVP (Producto Minimo Viable): el recorte jugable mas pequeno
que demuestra el loop principal (movimiento, combate, salas, UI y flujo de progreso).

## Sobre el juego (breve)
Juego top-down de accion/disparos con progresion por salas. La historia es simple: la noche cae sobre el hospital, las luces parpadean y los pasillos estan vacios; eres el ultimo en pie y debes sobrevivir y encontrar la salida. En el MVP recorres salas, peleas contra enemigos y avanzas hacia un boss, con HUD de vida/municion y pausa.

## Desarrolladores del proyecto
- Guillermo Duarte
- Nelson Duarte
- Matias Aguayo
- Katherine Varela
- Eduardo Ovelar

Gracias al equipo por su trabajo solido en la construccion e integracion de los sistemas centrales del proyecto.

## Motor
- Phaser 3 (Arcade Physics)

## Como correr
Este proyecto es estatico (sin build). Usa un servidor HTTP local para que JSON/asset carguen correctamente.

Opcion A (Python):
```bash
py -m http.server 8080
```

Opcion B (Node):
```bash
npx serve .
```

Luego abre en tu navegador:
```text
http://localhost:8080
```

## Flujo del juego (actual)
Start -> Menu -> Preload -> Narrative -> Hub -> Sector -> Hub -> Boss -> Ending -> Menu

## Arquitectura actual
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

## Alcance del MVP
- Loop principal: mover, disparar, melee, recibir dano
- Enemigos: walker/shooter/hybrid + comportamientos basicos de IA
- Sistema de salas: puertas, progresion por salas, flujo de sector
- UI: HUD (vida/municion) + menu de pausa
- Narrativa: escena de introduccion antes de hub/sector

## Notas
- Los assets son pesados; usa un servidor local en lugar de file:// para evitar problemas de CORS.
- Si GitHub no muestra todos los assets en la UI, usa enlaces raw o descarga el ZIP del repo.
