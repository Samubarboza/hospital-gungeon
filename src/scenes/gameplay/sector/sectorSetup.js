import { Player } from '../../../entities/player/Player.js';
import EnemyFactory from '../../../entities/enemies/EnemyFactory.js';
import { buildMap1 } from '../../../systems/maps/Map1Builder.js';

export function resetSceneTime(scene) {
    scene.scene.resume();
    scene.physics.world.resume();
    scene.physics.world.timeScale = 1;
    scene.time.timeScale = 1;
    scene.tweens.timeScale = 1;
    scene.anims.globalTimeScale = 1;
}

export function setupMap(scene) {
    const mapBuild = buildMap1(scene);
    scene.mapLayers = mapBuild.layers;
    scene.worldWidth = mapBuild.pixelWidth;
    scene.worldHeight = mapBuild.pixelHeight;

    scene.physics.world.setBounds(0, 0, scene.worldWidth, scene.worldHeight);
    scene.cameras.main.setBounds(0, 0, scene.worldWidth, scene.worldHeight);

    return mapBuild;
}

export function setupPlayer(scene, starterTemplate) {
    scene.roomScaleX = scene.worldWidth / starterTemplate.width;
    scene.roomScaleY = scene.worldHeight / starterTemplate.height;

    scene.player = new Player(
        scene,
        50 * scene.roomScaleX,
        (starterTemplate.height * 0.5) * scene.roomScaleY,
        1
    );
    scene.player.setDepth(10);

    if (scene.scene.isActive('HudScene')) {
        const hudScene = scene.scene.get('HudScene');
        if (hudScene) {
            hudScene.player = scene.player;
        }
    } else {
        scene.scene.launch('HudScene', { player: scene.player });
    }
    scene.scene.bringToTop('HudScene');

    scene.cameras.main.startFollow(scene.player, true, 0.1, 0.1);
}

export function setupStaticGroups(scene) {
    const showColliders = false;
    scene.walls = scene.physics.add.staticGroup();
    scene.obstacles = scene.physics.add.staticGroup();

    scene.addStaticRect = (group, x, y, width, height) => {
        const rect = scene.add.rectangle(
            x,
            y,
            width,
            height,
            0xff0000,
            showColliders ? 0.25 : 0
        );
        rect.setOrigin(0, 0);
        scene.physics.add.existing(rect, true);
        group.add(rect);
    };
}

export function setupEnemyAssets(scene) {
    scene.enemies = scene.physics.add.group();
    scene.enemyFactory = new EnemyFactory(scene);

    scene.enemyVariants = scene.registry.get('enemyVariants') || [];
    scene.enemyDefaultTexture = scene.registry.get('enemyDefaultTexture') || 'enemy';

    scene.enemyAnimMap = {
        walk: {},
        idle: {},
        idleBlink: {},
        attack: {},
        cast: {},
        taunt: {},
        hurt: {},
        dying: {}
    };

    scene.enemyVariants.forEach((variant) => {
        const walkKey = `${variant}-walk`;
        const idleKey = `${variant}-idle`;
        const idleBlinkKey = `${variant}-idleBlink`;
        const attackKey = `${variant}-attack`;
        const castKey = `${variant}-cast`;
        const tauntKey = `${variant}-taunt`;
        const hurtKey = `${variant}-hurt`;
        const dyingKey = `${variant}-dying`;
        scene.enemyAnimMap.walk[variant] = scene.anims.exists(walkKey) ? walkKey : null;
        scene.enemyAnimMap.idle[variant] = scene.anims.exists(idleKey) ? idleKey : null;
        scene.enemyAnimMap.idleBlink[variant] = scene.anims.exists(idleBlinkKey) ? idleBlinkKey : null;
        scene.enemyAnimMap.attack[variant] = scene.anims.exists(attackKey) ? attackKey : null;
        scene.enemyAnimMap.cast[variant] = scene.anims.exists(castKey) ? castKey : null;
        scene.enemyAnimMap.taunt[variant] = scene.anims.exists(tauntKey) ? tauntKey : null;
        scene.enemyAnimMap.hurt[variant] = scene.anims.exists(hurtKey) ? hurtKey : null;
        scene.enemyAnimMap.dying[variant] = scene.anims.exists(dyingKey) ? dyingKey : null;
    });

    scene.bossId = scene.registry.get('bossId') || 'boss1';
    scene.bossAnimMap = {
        idle: scene.anims.exists(`${scene.bossId}-idle`) ? `${scene.bossId}-idle` : null,
        idleBlink: scene.anims.exists(`${scene.bossId}-idleBlink`) ? `${scene.bossId}-idleBlink` : null,
        walk: scene.anims.exists(`${scene.bossId}-walk`) ? `${scene.bossId}-walk` : null,
        run: scene.anims.exists(`${scene.bossId}-run`) ? `${scene.bossId}-run` : null,
        jumpStart: scene.anims.exists(`${scene.bossId}-jumpStart`) ? `${scene.bossId}-jumpStart` : null,
        jumpLoop: scene.anims.exists(`${scene.bossId}-jumpLoop`) ? `${scene.bossId}-jumpLoop` : null,
        fall: scene.anims.exists(`${scene.bossId}-fall`) ? `${scene.bossId}-fall` : null,
        slide: scene.anims.exists(`${scene.bossId}-slide`) ? `${scene.bossId}-slide` : null,
        kick: scene.anims.exists(`${scene.bossId}-kick`) ? `${scene.bossId}-kick` : null,
        slash: scene.anims.exists(`${scene.bossId}-slash`) ? `${scene.bossId}-slash` : null,
        runSlash: scene.anims.exists(`${scene.bossId}-runSlash`) ? `${scene.bossId}-runSlash` : null,
        throw: scene.anims.exists(`${scene.bossId}-throw`) ? `${scene.bossId}-throw` : null,
        runThrow: scene.anims.exists(`${scene.bossId}-runThrow`) ? `${scene.bossId}-runThrow` : null,
        throwAir: scene.anims.exists(`${scene.bossId}-throwAir`) ? `${scene.bossId}-throwAir` : null,
        slashAir: scene.anims.exists(`${scene.bossId}-slashAir`) ? `${scene.bossId}-slashAir` : null,
        cast: scene.anims.exists(`${scene.bossId}-cast`) ? `${scene.bossId}-cast` : null,
        taunt: scene.anims.exists(`${scene.bossId}-taunt`) ? `${scene.bossId}-taunt` : null,
        hurt: scene.anims.exists(`${scene.bossId}-hurt`) ? `${scene.bossId}-hurt` : null,
        dying: scene.anims.exists(`${scene.bossId}-dying`) ? `${scene.bossId}-dying` : null
    };
}

