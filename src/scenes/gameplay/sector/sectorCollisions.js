export function setupSectorCollisions(scene, combatSystem) {
    const colliders = [];

    colliders.push(scene.physics.add.collider(scene.player, scene.walls));
    colliders.push(scene.physics.add.collider(scene.player, scene.obstacles));

    colliders.push(scene.physics.add.collider(scene.player.bullets, scene.walls, (bullet) => {
        bullet.disableBody(true, true);
    }));
    colliders.push(scene.physics.add.collider(scene.player.bullets, scene.obstacles, (bullet) => {
        bullet.disableBody(true, true);
    }));

    colliders.push(scene.physics.add.collider(scene.enemies, scene.walls));
    colliders.push(scene.physics.add.collider(scene.enemies, scene.obstacles));

    const bulletOverlap = scene.physics.add.overlap(
        scene.player.bullets,
        scene.enemies,
        combatSystem.onBulletHitEnemy,
        null,
        scene
    );
    const playerOverlap = scene.physics.add.overlap(
        scene.player,
        scene.enemies,
        combatSystem.onPlayerHitEnemy,
        null,
        scene
    );

    colliders.push(bulletOverlap, playerOverlap);

    return {
        destroy() {
            colliders.forEach((collider) => {
                if (collider && collider.destroy) collider.destroy();
            });
        }
    };
}
