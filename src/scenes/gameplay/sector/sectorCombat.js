export function createCombatSystem(scene, enemySystem) {
    const applyDamageToEnemy = (enemy, damage) => {
        if (!enemy || damage <= 0) return;
        if (enemy.getData?.('isDying')) return;

        if (typeof enemy.takeDamage === 'function') {
            enemy.takeDamage(damage);
            return;
        }

        const hp = enemy.getData('hp') - damage;
        enemy.setData('hp', hp);
        if (hp <= 0) {
            if (enemy.getData('isBoss')) {
                enemySystem.playBossDeath(enemy);
            } else {
                enemySystem.playEnemyDeath(enemy);
            }
            return;
        }
        if (enemy.getData('isBoss')) {
            enemySystem.playBossHurt(enemy);
        } else {
            enemySystem.playEnemyHurt(enemy);
        }
    };

    const onBulletHitEnemy = (bullet, enemy) => {
        bullet.disableBody(true, true);
        applyDamageToEnemy(enemy, scene.player.stats.damage);
    };

    const onPlayerHitEnemy = (player, enemy) => {
        if (enemy.stateMachine) return;
        const now = scene.time.now;
        const lastHit = enemy.getData('lastHit') || 0;
        if (now - lastHit < 400) return;
        enemy.setData('lastHit', now);
        if (enemy.getData('isBoss')) {
            const nextAttackAt = enemy.getData('nextAttackAt') || 0;
            if (now >= nextAttackAt) {
                const melee = ['kick', 'slash', 'runSlash'];
                enemySystem.playBossAction(enemy, Phaser.Utils.Array.GetRandom(melee));
                enemy.setData('nextAttackAt', now + 700);
            }
            player.receiveHit(20, enemy);
            return;
        }
        const nextAttackAt = enemy.getData('nextAttackAt') || 0;
        if (now >= nextAttackAt) {
            enemySystem.playEnemyAction(enemy, 'attack');
            enemy.setData('nextAttackAt', now + 700);
        }
        player.receiveHit(10, enemy);
    };

    const handleMeleeHits = () => {
        const player = scene.player;
        if (!player || !player.stats) return;
        const now = scene.time.now;
        if (!player.meleeActiveUntil || now > player.meleeActiveUntil) return;
        if (!player.body) return;

        const hitIds = player.meleeHitIds || (player.meleeHitIds = new Set());
        const pad = 8;
        const meleeRect = {
            x: player.body.x - pad,
            y: player.body.y - pad,
            width: player.body.width + pad * 2,
            height: player.body.height + pad * 2
        };
        const damage = player.stats.meleeDamage ?? 20;

        scene.enemies.getChildren().forEach((enemy) => {
            if (!enemy || !enemy.active || !enemy.body) return;
            if (hitIds.has(enemy)) return;
            const enemyRect = {
                x: enemy.body.x,
                y: enemy.body.y,
                width: enemy.body.width,
                height: enemy.body.height
            };
            if (!Phaser.Geom.Intersects.RectangleToRectangle(meleeRect, enemyRect)) return;
            hitIds.add(enemy);
            applyDamageToEnemy(enemy, damage);
        });
    };

    return {
        applyDamageToEnemy,
        onBulletHitEnemy,
        onPlayerHitEnemy,
        handleMeleeHits
    };
}
