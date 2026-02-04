const TILE_SIZE = 16;
const MAP_WIDTH = 64;
const MAP_HEIGHT = 48;

const TILESET_COLUMNS = {
    wallsFloor: 13,
    water: 43,
    objects: 24
};

const TILES = {
    floor: 254,
    wall: 14,
    water: 1045,
    objects: {
        crate: 12,
        barrel: 61,
        barrel2: 60,
        sack: 15,
        box: 13
    }
};

const createLayer = () => Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill(-1));

const fillRect = (layer, x, y, width, height, tileIndex) => {
    for (let row = y; row < y + height; row += 1) {
        for (let col = x; col < x + width; col += 1) {
            if (row < 0 || row >= MAP_HEIGHT || col < 0 || col >= MAP_WIDTH) continue;
            layer[row][col] = tileIndex;
        }
    }
};

const buildFloorLayer = () => {
    const layer = createLayer();
    fillRect(layer, 0, 0, MAP_WIDTH, MAP_HEIGHT, TILES.floor);
    return layer;
};

const buildWallLayer = () => {
    const layer = createLayer();
    const thickness = 2;

    fillRect(layer, 0, 0, MAP_WIDTH, thickness, TILES.wall);
    fillRect(layer, 0, MAP_HEIGHT - thickness, MAP_WIDTH, thickness, TILES.wall);
    fillRect(layer, 0, 0, thickness, MAP_HEIGHT, TILES.wall);
    fillRect(layer, MAP_WIDTH - thickness, 0, thickness, MAP_HEIGHT, TILES.wall);

    const doorHeight = 4;
    const doorWidth = 4;
    const midY = Math.floor(MAP_HEIGHT / 2);

    fillRect(layer, 0, midY - Math.floor(doorHeight / 2), thickness, doorHeight, -1);
    fillRect(layer, MAP_WIDTH - thickness, midY - Math.floor(doorHeight / 2), thickness, doorHeight, -1);

    const bottomDoorX = Math.floor(MAP_WIDTH / 2) - Math.floor(doorWidth / 2);
    fillRect(layer, bottomDoorX, MAP_HEIGHT - thickness, doorWidth, thickness, -1);

    return layer;
};

const buildWaterLayer = () => {
    const layer = createLayer();

    fillRect(layer, 48, 32, 14, 10, TILES.water);
    fillRect(layer, 44, 36, 4, 6, TILES.water);
    fillRect(layer, 52, 30, 8, 2, TILES.water);

    return layer;
};

const buildPropsLayer = () => {
    const layer = createLayer();

    layer[8][6] = TILES.objects.crate;
    layer[8][7] = TILES.objects.barrel;
    layer[8][8] = TILES.objects.barrel2;

    layer[8][46] = TILES.objects.barrel;
    layer[8][47] = TILES.objects.barrel2;

    layer[38][6] = TILES.objects.barrel;
    layer[38][7] = TILES.objects.barrel2;

    layer[38][44] = TILES.objects.barrel;
    layer[38][45] = TILES.objects.barrel2;
    layer[38][46] = TILES.objects.sack;

    layer[30][10] = TILES.objects.box;
    layer[30][12] = TILES.objects.sack;

    return layer;
};

export const MAP1_LAYOUT = {
    tileSize: TILE_SIZE,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    tilesetColumns: TILESET_COLUMNS,
    tiles: TILES,
    layers: {
        floor: buildFloorLayer(),
        walls: buildWallLayer(),
        water: buildWaterLayer(),
        props: buildPropsLayer()
    }
};
