document.addEventListener("DOMContentLoaded", startGame);

//#region startgame
function startGame() {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);
  const socket = io();

  const createScene = () => {
    //player settings 
    const playerSpeed = 0.1;
    const playerPosition = { x: 0, y: 0, z: 0 };

    const scene = new BABYLON.Scene(engine);
    const cubeManager = CubeManager(scene);
    const mapManager = MapManager(scene);

    // Map Settings
    mapManager.createDefaultSkybox();
    mapManager.createDefaultLight();
    mapManager.createDefaultGround();
    mapManager.loadMultipleMeshes();
    mapManager.createGUI();
    // mapManager.importResourceModelAsync("character.glb")
    // mapManager.createGroundHeightMap();

    //camera1
    const camera1 = mapManager.createDefaultCamera1(canvas);
    const socketManager = createSocketIOManager(socket, cubeManager, camera1);
    socketManager.initialize();

    CharacterControlManager(scene, camera1)

    window.addEventListener("keydown", (event) => {
      const currentPlayerId = socketManager.getCurrentPlayerId();
      if (currentPlayerId && cubeManager.cubes[currentPlayerId]) {
        switch (event.key) {
          case "w":
            playerPosition.z += playerSpeed;
            break; // Move forward
          case "s":
            playerPosition.z -= playerSpeed;
            break; // Move backward
          case "a":
            playerPosition.x -= playerSpeed;
            break; // Move left
          case "d":
            playerPosition.x += playerSpeed;
            break; // Move right
          case "q":
            playerPosition.y -= playerSpeed;
            break; // Move down
          case "e":
            playerPosition.y += playerSpeed;
            break; // Move up
        }
        cubeManager.moveCube(currentPlayerId, playerPosition);
        socket.emit("moveCube", playerPosition);
      }
    });

    return scene;
  };

  const scene = createScene();

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });
}
//#endregion
