# Hospital Gungeon – Arquitectura (v1)

## Principios
- El flujo del juego NO se decide en las escenas.
- Las escenas NO se conocen entre sí.
- La comunicación es SOLO por EventBus.
- El core (`src/core/`) es intocable sin aprobación del Team Lead.

## Capas
- **core/**
  - EventBus: contrato de comunicación.
  - RunManager: lógica de run (sectores, boss, ending).
- **scenes/**
  - Presentación y entrada del jugador.
  - Emiten eventos; no deciden el flujo global.
- **main.js**
  - Registra escenas.
  - Inicializa el core.

## Regla
Si una escena necesita “saber qué sigue”, está mal diseñada.
Debe emitir un evento y esperar respuesta.
