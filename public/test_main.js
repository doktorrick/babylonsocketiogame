
// import { CubeMan } from "./static.js";
document.addEventListener("DOMContentLoaded", startGame);

//#region startgame
function startGame() {
  const canvas = document.getElementById("renderCanvas");
  // const sceneBuilder = new SceneBuilder(canvas);
  const startPosition = new BABYLON.Vector3(5, 0, 5);

  const mainPlayer = {
    modelPaht: "/resources/models/",
    scale: 10.5
  }

  // const socketManager = new SocketManager();
  const gameEnviroment = new Environment(canvas);
  gameEnviroment.createPlayer(mainPlayer.modelPaht, mainPlayer.scale);
  // sceneBuilder
  //   .addDefaultCamera()
  //   .addYAxis()
  //   .addDefaultGround()
  //   .addDefaultSkybox()
  //   .addDefaultLight()
  //   .addCharacter(CubeMan, 10.5)
  //   .addEnemy(CubeMan,  10.5, startPosition, 3) // Add enemy
  //   .render();
}
//#endregion
