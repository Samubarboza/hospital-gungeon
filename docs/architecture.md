hospital-gungeon/
│
├── package.json
├── vite.config.js              # o config del bundler
├── index.html
├── README.md
│
├── public/
│   ├── assets/
│   │   ├── sprites/
│   │   │   ├── player/
│   │   │   ├── enemies/
│   │   │   ├── bosses/
│   │   │   ├── weapons/
│   │   │   ├── props/
│   │   │   └── ui/
│   │   │
│   │   ├── audio/
│   │   │   ├── sfx/
│   │   │   └── music/
│   │   │
│   │   └── tilesets/
│   │
│   └── fonts/
│
├── src/
│   │
│   ├── main.js                 # bootstrap Phaser
│   ├── game.js                 # config global del juego
│   │
│   ├── config/
│   │   ├── constants.js        # números mágicos, keys, enums
│   │   ├── inputMap.js
│   │   └── layers.js
│   │
│   ├── core/                   # cosas delicadas → TUYO
│   │   ├── EventBus.js
│   │   ├── SaveManager.js
│   │   ├── RunManager.js
│   │   ├── SceneManager.js
│   │   └── GameState.js
│   │
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── PreloadScene.js
│   │   ├── MenuScene.js
│   │   ├── HubScene.js
│   │   ├── SectorScene.js      # escena genérica por sector
│   │   └── BossScene.js
│   │
│   ├── entities/
│   │   ├── player/
│   │   │   ├── Player.js
│   │   │   ├── PlayerController.js
│   │   │   └── PlayerStats.js
│   │   │
│   │   ├── enemies/
│   │   │   ├── EnemyBase.js
│   │   │   ├── EnemyFactory.js
│   │   │   └── types/
│   │   │       ├── Walker.js
│   │   │       ├── Shooter.js
│   │   │       └── Hybrid.js
│   │   │
│   │   └── bosses/
│   │       ├── BossBase.js
│   │       └── MirrorBoss.js
│   │
│   ├── systems/
│   │   ├── combat/
│   │   │   ├── WeaponSystem.js
│   │   │   ├── ProjectileSystem.js
│   │   │   └── DamageSystem.js
│   │   │
│   │   ├── rooms/
│   │   │   ├── RoomLoader.js
│   │   │   ├── RoomTemplates.js
│   │   │   └── DoorSystem.js
│   │   │
│   │   ├── progression/
│   │   │   ├── UpgradeSystem.js
│   │   │   ├── MutationSystem.js
│   │   │   └── MetaProgression.js
│   │   │
│   │   └── ai/
│   │       ├── StateMachine.js
│   │       └── Behaviors.js
│   │
│   ├── ui/
│   │   ├── hud/
│   │   │   ├── HealthBar.js
│   │   │   ├── AmmoBar.js
│   │   │   └── StatusIcons.js
│   │   │
│   │   ├── dialogs/
│   │   │   ├── DialogQueue.js
│   │   │   └── DialogPanel.js
│   │   │
│   │   └── menus/
│   │       ├── PauseMenu.js
│   │       └── SettingsMenu.js
│   │
│   ├── narrative/
│   │   ├── NarrativeSystem.js
│   │   └── Triggers.js
│   │
│   ├── data/                   # SOLO JSON
│   │   ├── weapons.json
│   │   ├── enemies.json
│   │   ├── bosses.json
│   │   ├── upgrades.json
│   │   ├── rooms/
│   │   │   ├── er.json
│   │   │   ├── surgery.json
│   │   │   ├── labs.json
│   │   │   ├── psych.json
│   │   │   └── basement.json
│   │   └── narrative/
│   │       ├── echo.json
│   │       ├── logs.json
│   │       └── endings.json
│   │
│   └── utils/
│       ├── math.js
│       ├── random.js
│       └── debug.js
│
└── docs/
    ├── architecture.md
    ├── coding-guidelines.md
    └── dev-onboarding.md
