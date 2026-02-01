class SceneManager {
    go(fromScene, toSceneKey, data = {}) {
    // Esto SÍ detiene la escena actual y evita superposición
    fromScene.scene.start(toSceneKey, data);
}
}

export const sceneManager = new SceneManager();
