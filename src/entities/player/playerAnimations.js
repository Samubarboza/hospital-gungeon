const SHEET_COLS = 11;

export const PLAYER_SHEET = {
    key: 'player',
    frameWidth: 128,
    frameHeight: 128,
    cols: SHEET_COLS
};

const frame = (row, col) => row * SHEET_COLS + col;
const range = (row, from, to) =>
    Array.from({ length: to - from + 1 }, (_, index) => frame(row, from + index));

export const PLAYER_ANIMS = {
    idleDown: [frame(0, 0)],
    walkDown: range(0, 0, 10),
    idleUp: [frame(4, 0)],
    walkUp: range(4, 0, 10),
    idleRight: [frame(3, 0)],
    walkRight: range(3, 0, 10),
    shootRight: range(3, 0, 10),
    hit: [frame(0, 0)],
    death: [frame(0, 0)]
};

const framesFor = (frames) => frames.map((frameIndex) => ({ key: PLAYER_SHEET.key, frame: frameIndex }));

const createAnim = (scene, key, frames, frameRate, repeat) => {
    if (scene.anims.exists(key)) return;
    scene.anims.create({
        key,
        frames: framesFor(frames),
        frameRate,
        repeat
    });
};

export const registerPlayerAnims = (scene) => {
    createAnim(scene, 'player-idle-down', PLAYER_ANIMS.idleDown, 1, 0);
    createAnim(scene, 'player-walk-down', PLAYER_ANIMS.walkDown, 12, -1);
    createAnim(scene, 'player-idle-up', PLAYER_ANIMS.idleUp, 1, 0);
    createAnim(scene, 'player-walk-up', PLAYER_ANIMS.walkUp, 12, -1);
    createAnim(scene, 'player-idle-right', PLAYER_ANIMS.idleRight, 1, 0);
    createAnim(scene, 'player-walk-right', PLAYER_ANIMS.walkRight, 12, -1);
    createAnim(scene, 'player-shoot-right', PLAYER_ANIMS.shootRight, 12, 0);
    createAnim(scene, 'player-hit', PLAYER_ANIMS.hit, 10, 0);
    createAnim(scene, 'player-death', PLAYER_ANIMS.death, 6, 0);
};
