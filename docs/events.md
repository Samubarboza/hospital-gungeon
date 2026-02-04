# Hospital Gungeon – Eventos Oficiales (v1)

## Lista cerrada de eventos
No se inventan eventos nuevos sin aprobación.

- game:start
- hub:continue
- sector:enter
- sector:complete
- boss:enter
- boss:defeated
- ending:show

## Quién emite / quién escucha

### game:start
- Emite: Start, MenuScene
- Escucha: RunManager

### hub:continue
- Emite: HubScene
- Escucha: RunManager

### sector:enter
- Emite: RunManager
- Escucha: HubScene

### sector:complete
- Emite: SectorScene
- Escucha: RunManager

### boss:enter
- Emite: RunManager
- Escucha: HubScene

### boss:defeated
- Emite: BossScene
- Escucha: RunManager

### ending:show
- Emite: RunManager
- Escucha: BossScene
