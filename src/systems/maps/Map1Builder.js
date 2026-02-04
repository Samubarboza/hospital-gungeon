import { TILE_SIZE, buildRectLayout } from './Map1Layout.js';

export function buildMap1(scene) {
    const tileSize = TILE_SIZE;
    const tilesWide = Math.max(8, Math.ceil(scene.scale.width / tileSize));
    const tilesHigh = Math.max(6, Math.ceil(scene.scale.height / tileSize));
    const { width, height, layers } = buildRectLayout(tilesWide, tilesHigh);
    const pixelWidth = width * tileSize;
    const pixelHeight = height * tileSize;

    const scaleX = scene.scale.width / pixelWidth;
    const scaleY = scene.scale.height / pixelHeight;

    const map = scene.make.tilemap({
        tileWidth: tileSize,
        tileHeight: tileSize,
        width,
        height
    });

    const floorSet = map.addTilesetImage('rect-tiles', 'rect-tiles', tileSize, tileSize, 0, 0);

    const floorLayer = map.createBlankLayer('floor', floorSet, 0, 0);
    floorLayer.putTilesAt(layers.floor, 0, 0);

    const wallLayer = map.createBlankLayer('walls', floorSet, 0, 0);
    wallLayer.putTilesAt(layers.walls, 0, 0);

    let waterLayer = null;
    let propsLayer = null;
    if (layers.water) {
        waterLayer = map.createBlankLayer('water', floorSet, 0, 0);
        waterLayer.putTilesAt(layers.water, 0, 0);
    }
    if (layers.props) {
        propsLayer = map.createBlankLayer('props', floorSet, 0, 0);
        propsLayer.putTilesAt(layers.props, 0, 0);
    }

    floorLayer.setDepth(0);
    if (waterLayer) waterLayer.setDepth(1);
    wallLayer.setDepth(2);
    if (propsLayer) propsLayer.setDepth(3);

    floorLayer.setScale(scaleX, scaleY);
    if (waterLayer) waterLayer.setScale(scaleX, scaleY);
    wallLayer.setScale(scaleX, scaleY);
    if (propsLayer) propsLayer.setScale(scaleX, scaleY);

    return {
        map,
        layers: {
            floorLayer,
            waterLayer,
            wallLayer,
            propsLayer
        },
        scale: { x: scaleX, y: scaleY },
        pixelWidth: pixelWidth * scaleX,
        pixelHeight: pixelHeight * scaleY
    };
}
