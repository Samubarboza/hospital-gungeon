const CAPTURE_KEYS = [
    Phaser.Input.Keyboard.KeyCodes.UP,
    Phaser.Input.Keyboard.KeyCodes.DOWN,
    Phaser.Input.Keyboard.KeyCodes.LEFT,
    Phaser.Input.Keyboard.KeyCodes.RIGHT,
    Phaser.Input.Keyboard.KeyCodes.W,
    Phaser.Input.Keyboard.KeyCodes.A,
    Phaser.Input.Keyboard.KeyCodes.S,
    Phaser.Input.Keyboard.KeyCodes.D,
    Phaser.Input.Keyboard.KeyCodes.SPACE,
    Phaser.Input.Keyboard.KeyCodes.SHIFT
];

export function setupSectorInput(scene) {
    const keyboard = scene.input?.keyboard;
    if (keyboard) {
        keyboard.enabled = true;
        keyboard.addCapture(CAPTURE_KEYS);
    }

    scene.pauseKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    scene.pauseAltKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    const focusHandler = () => {
        if (scene.game?.canvas) {
            scene.game.canvas.focus();
        }
    };

    if (scene.game?.canvas) {
        scene.game.canvas.setAttribute('tabindex', '0');
        focusHandler();
        scene.input?.on('pointerdown', focusHandler);
    }

    return {
        handlePauseInput() {
            if (!scene.pauseKey && !scene.pauseAltKey) return false;
            if (
                (scene.pauseKey && Phaser.Input.Keyboard.JustDown(scene.pauseKey)) ||
                (scene.pauseAltKey && Phaser.Input.Keyboard.JustDown(scene.pauseAltKey))
            ) {
                scene.openPauseMenu();
                return true;
            }
            return false;
        },
        cleanup() {
            if (scene.input) {
                scene.input.off('pointerdown', focusHandler);
            }
        }
    };
}

export function setSceneInputEnabled(scene, enabled) {
    if (!scene.input) return;
    scene.input.enabled = enabled;
    if (scene.input.keyboard) {
        scene.input.keyboard.enabled = enabled;
    }
}
