import { MAP1_LAYOUT } from './Map1Layout.js';

export function buildMap1(scene) {
    const { tileSize, width, height, layers } = MAP1_LAYOUT;
    const pixelWidth = width * tileSize;
    const pixelHeight = height * tileSize;

    const scale = Math.min(
        scene.scale.width / pixelWidth,
        scene.scale.height / pixelHeight
    );

    const map = scene.make.tilemap({
        tileWidth: tileSize,
        tileHeight: tileSize,
        width,
        height
    });

    const floorSet = map.addTilesetImage('map1-walls-floor', 'map1-walls-floor', tileSize, tileSize, 0, 0);
    const waterSet = map.addTilesetImage('map1-water', 'map1-water', tileSize, tileSize, 0, 0);
    const objectSet = map.addTilesetImage('map1-objects', 'map1-objects', tileSize, tileSize, 0, 0);

    const floorLayer = map.createBlankLayer('floor', floorSet, 0, 0);
    floorLayer.putTilesAt(layers.floor, 0, 0);

    const wallLayer = map.createBlankLayer('walls', floorSet, 0, 0);
    wallLayer.putTilesAt(layers.walls, 0, 0);

    const waterLayer = map.createBlankLayer('water', waterSet, 0, 0);
    waterLayer.putTilesAt(layers.water, 0, 0);

    const propsLayer = map.createBlankLayer('props', objectSet, 0, 0);
    propsLayer.putTilesAt(layers.props, 0, 0);

    floorLayer.setDepth(0);
    waterLayer.setDepth(1);
    wallLayer.setDepth(2);
    propsLayer.setDepth(3);

    if (scale !== 1) {
        floorLayer.setScale(scale);
        waterLayer.setScale(scale);
        wallLayer.setScale(scale);
        propsLayer.setScale(scale);
    }

    return {
        map,
        layers: {
            floorLayer,
            waterLayer,
            wallLayer,
            propsLayer
        },
        scale,
        pixelWidth: pixelWidth * scale,
        pixelHeight: pixelHeight * scale
    };
}
