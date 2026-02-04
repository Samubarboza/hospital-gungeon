export const TILE_SIZE = 16;

// Ajusta estos indices segun el tileset (rect_tiles.png).
export const TILES = {
    floor: 0,
    wall: 1
};

const createLayer = (width, height) =>
    Array.from({ length: height }, () => Array(width).fill(-1));

const fillRect = (layer, width, height, x, y, rectWidth, rectHeight, tileIndex) => {
    for (let row = y; row < y + rectHeight; row += 1) {
        for (let col = x; col < x + rectWidth; col += 1) {
            if (row < 0 || row >= height || col < 0 || col >= width) continue;
            layer[row][col] = tileIndex;
        }
    }
};

const buildFloorLayer = (width, height) => {
    const layer = createLayer(width, height);
    fillRect(layer, width, height, 0, 0, width, height, TILES.floor);
    return layer;
};

const buildWallLayer = (width, height) => {
    const layer = createLayer(width, height);
    const thickness = 2;

    fillRect(layer, width, height, 0, 0, width, thickness, TILES.wall);
    fillRect(layer, width, height, 0, height - thickness, width, thickness, TILES.wall);
    fillRect(layer, width, height, 0, 0, thickness, height, TILES.wall);
    fillRect(layer, width, height, width - thickness, 0, thickness, height, TILES.wall);

    const doorHeight = 4;
    const midY = Math.floor(height / 2);

    fillRect(layer, width, height, 0, midY - Math.floor(doorHeight / 2), thickness, doorHeight, -1);
    fillRect(layer, width, height, width - thickness, midY - Math.floor(doorHeight / 2), thickness, doorHeight, -1);

    return layer;
};

export const buildRectLayout = (width, height) => ({
    tileSize: TILE_SIZE,
    width,
    height,
    tiles: TILES,
    layers: {
        floor: buildFloorLayer(width, height),
        walls: buildWallLayer(width, height),
        water: null,
        props: null
    }
});
