/**
 * Calcula la distancia entre dos puntos
 */
export function distanceBetween(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcula el ángulo entre dos objetos
 */
export function angleBetween(obj1, obj2) {
    return Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
}

/**
 * Mueve un objeto hacia un objetivo
 */
export function moveTowards(sprite, target, speed) {
    const angle = angleBetween(sprite, target);
    sprite.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
    );
}

/**
 * Mueve un objeto alejándose de un objetivo
 */
export function moveAway(sprite, target, speed) {
    const angle = angleBetween(sprite, target);
    sprite.setVelocity(
        -Math.cos(angle) * speed,
        -Math.sin(angle) * speed
    );
}

/**
 * Detiene el movimiento de un sprite
 */
export function stopMovement(sprite) {
    sprite.setVelocity(0, 0);
}

/**
 * Verifica si un objetivo está en línea de visión
 */
export function hasLineOfSight(scene, enemy, target, maxDistance = 500) {
    const distance = distanceBetween(enemy, target);
    
    if (distance > maxDistance) {
        return false;
    }

    // Raycast simple para verificar obstrucciones
    // Si tienes tilemap con colisiones, aquí podrías hacer un raycast más complejo
    return true;
}

/**
 * Voltea el sprite según la dirección del movimiento
 */
export function flipTowardsTarget(sprite, target) {
    if (target.x < sprite.x) {
        sprite.setFlipX(true);
    } else {
        sprite.setFlipX(false);
    }
}

/**
 * Comportamiento de patrulla simple
 */
export function patrol(sprite, patrolPoints, currentIndex, speed) {
    if (!patrolPoints || patrolPoints.length === 0) {
        return currentIndex;
    }

    const target = patrolPoints[currentIndex];
    const distance = distanceBetween(sprite, target);

    if (distance < 10) {
        // Llegó al punto, ir al siguiente
        return (currentIndex + 1) % patrolPoints.length;
    }

    moveTowards(sprite, target, speed);
    return currentIndex;
}

/**
 * Mantiene distancia óptima del objetivo
 */
export function maintainDistance(sprite, target, optimalDistance, speed, tolerance = 50) {
    const distance = distanceBetween(sprite, target);

    if (distance > optimalDistance + tolerance) {
        // Muy lejos, acercarse
        moveTowards(sprite, target, speed);
    } else if (distance < optimalDistance - tolerance) {
        // Muy cerca, alejarse
        moveAway(sprite, target, speed);
    } else {
        // En rango óptimo, circular o detenerse
        stopMovement(sprite);
    }
}

/**
 * Verifica si el enemigo puede atacar
 */
export function canAttack(enemy, lastAttackTime, attackCooldown) {
    const currentTime = enemy.scene.time.now;
    return (currentTime - lastAttackTime) >= attackCooldown;
}

/**
 * Crea una bala simple
 */
export function shootProjectile(scene, enemy, target, bulletSpeed = 300, bulletKey = 'bullet') {
    const angle = angleBetween(enemy, target);
    
    // Crear bala (necesitarás tener el sprite 'bullet' cargado)
    const bullet = scene.physics.add.sprite(enemy.x, enemy.y, bulletKey);
    bullet.setScale(0.5);
    bullet.setVelocity(
        Math.cos(angle) * bulletSpeed,
        Math.sin(angle) * bulletSpeed
    );
    
    // Destruir bala después de 3 segundos
    scene.time.delayedCall(3000, () => {
        if (bullet && bullet.active) {
            bullet.destroy();
        }
    });

    return bullet;
}

/**
 * Comprueba si el enemigo está atascado
 */
export function isStuck(sprite, lastPosition, threshold = 5) {
    if (!lastPosition) {
        return false;
    }

    const distance = distanceBetween(sprite, lastPosition);
    return distance < threshold;
}

/**
 * Comportamiento de vagabundeo aleatorio
 */
export function wander(sprite, speed, changeDirectionChance = 0.02) {
    if (Math.random() < changeDirectionChance) {
        const angle = Math.random() * Math.PI * 2;
        sprite.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    }
}