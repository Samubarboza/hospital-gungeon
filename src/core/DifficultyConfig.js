export const DIFFICULTY_KEYS = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
};

export const PLAYER_BASE_STATS = {
    health: 100,
    speed: 200,
    damage: 10,
    maxAmmo: 10,
    meleeDamage: 25,
    runMultiplier: 1.6
};

export const CONTACT_DAMAGE_BASE = {
    enemy: 10,
    boss: 20
};

export const BOSS_BASE_STATS = {
    health: 900,
    speed: 130,
    damage: 20
};

const DIFFICULTY_PRESETS = {
    [DIFFICULTY_KEYS.EASY]: {
        key: DIFFICULTY_KEYS.EASY,
        label: 'Facil',
        player: {
            healthMultiplier: 1.3,
            damageMultiplier: 1.1,
            speedMultiplier: 1,
            ammoMultiplier: 1.2,
            meleeDamageMultiplier: 1.1
        },
        enemy: {
            healthMultiplier: 0.85,
            damageMultiplier: 0.85,
            speedMultiplier: 0.9
        },
        boss: {
            healthMultiplier: 0.9,
            damageMultiplier: 0.9,
            speedMultiplier: 0.95
        },
        spawn: {
            delayMultiplier: 1.2,
            perWaveMultiplier: 0.9,
            maxAliveMultiplier: 0.85
        },
        resources: {
            ammoMultiplier: 1.2,
            healthMultiplier: 1.15
        },
        drops: {
            chanceMultiplier: 1.2
        },
        damage: {
            playerMultiplier: 1.1,
            enemyMultiplier: 0.85
        }
    },
    [DIFFICULTY_KEYS.MEDIUM]: {
        key: DIFFICULTY_KEYS.MEDIUM,
        label: 'Medio',
        player: {
            healthMultiplier: 1,
            damageMultiplier: 1,
            speedMultiplier: 1,
            ammoMultiplier: 1,
            meleeDamageMultiplier: 1
        },
        enemy: {
            healthMultiplier: 1,
            damageMultiplier: 1,
            speedMultiplier: 1
        },
        boss: {
            healthMultiplier: 1,
            damageMultiplier: 1,
            speedMultiplier: 1
        },
        spawn: {
            delayMultiplier: 1,
            perWaveMultiplier: 1,
            maxAliveMultiplier: 1
        },
        resources: {
            ammoMultiplier: 1,
            healthMultiplier: 1
        },
        drops: {
            chanceMultiplier: 1
        },
        damage: {
            playerMultiplier: 1,
            enemyMultiplier: 1
        }
    },
    [DIFFICULTY_KEYS.HARD]: {
        key: DIFFICULTY_KEYS.HARD,
        label: 'Dificil',
        player: {
            healthMultiplier: 0.85,
            damageMultiplier: 0.9,
            speedMultiplier: 1,
            ammoMultiplier: 0.9,
            meleeDamageMultiplier: 0.9
        },
        enemy: {
            healthMultiplier: 1.2,
            damageMultiplier: 1.2,
            speedMultiplier: 1.1
        },
        boss: {
            healthMultiplier: 1.25,
            damageMultiplier: 1.25,
            speedMultiplier: 1.1
        },
        spawn: {
            delayMultiplier: 0.85,
            perWaveMultiplier: 1.1,
            maxAliveMultiplier: 1.15
        },
        resources: {
            ammoMultiplier: 0.85,
            healthMultiplier: 0.85
        },
        drops: {
            chanceMultiplier: 0.8
        },
        damage: {
            playerMultiplier: 0.9,
            enemyMultiplier: 1.2
        }
    }
};

export function normalizeDifficulty(key) {
    if (!key) return DIFFICULTY_KEYS.MEDIUM;
    const lowered = String(key).toLowerCase();
    if (['easy', 'facil', 'fácil'].includes(lowered)) return DIFFICULTY_KEYS.EASY;
    if (['hard', 'dificil', 'difícil'].includes(lowered)) return DIFFICULTY_KEYS.HARD;
    if (['medium', 'medio'].includes(lowered)) return DIFFICULTY_KEYS.MEDIUM;
    return DIFFICULTY_KEYS.MEDIUM;
}

export function getDifficultyConfig(sceneOrKey) {
    if (sceneOrKey && sceneOrKey.registry) {
        const stored = sceneOrKey.registry.get('difficultyConfig');
        if (stored) return stored;
    }
    const key = typeof sceneOrKey === 'string' ? normalizeDifficulty(sceneOrKey) : DIFFICULTY_KEYS.MEDIUM;
    return DIFFICULTY_PRESETS[key] || DIFFICULTY_PRESETS[DIFFICULTY_KEYS.MEDIUM];
}

export function setDifficulty(scene, key) {
    const normalized = normalizeDifficulty(key);
    const config = DIFFICULTY_PRESETS[normalized] || DIFFICULTY_PRESETS[DIFFICULTY_KEYS.MEDIUM];
    if (scene?.registry) {
        scene.registry.set('difficulty', normalized);
        scene.registry.set('difficultyConfig', config);
        scene.registry.set('difficultyLabel', config.label);
    }
    return config;
}

export function ensureDifficulty(scene) {
    if (!scene?.registry) return getDifficultyConfig(DIFFICULTY_KEYS.MEDIUM);
    const stored = scene.registry.get('difficulty');
    if (!stored) {
        return setDifficulty(scene, DIFFICULTY_KEYS.MEDIUM);
    }
    return getDifficultyConfig(scene);
}

export function getDifficultyLabel(scene) {
    if (scene?.registry) {
        const label = scene.registry.get('difficultyLabel');
        if (label) return label;
    }
    return DIFFICULTY_PRESETS[DIFFICULTY_KEYS.MEDIUM].label;
}

export function getDifficultyPresets() {
    return { ...DIFFICULTY_PRESETS };
}
