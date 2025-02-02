const players = {};

const createPlayer = (scene, id, position = { x: 0, y: 0, z: 0, rotation: { } }, mat = "crate", ground) => {
  let options = { size: 1 };

  if (mat === "face") {
      var faceUV = new Array(6);
      faceUV[0] = new BABYLON.Vector4(1 / 3, 0, 2 / 3, 0.5);
      faceUV[1] = new BABYLON.Vector4(0, 0.5, 1 / 3, 1);
      faceUV[2] = new BABYLON.Vector4(2 / 3, 0, 1, 0.5);
      faceUV[3] = new BABYLON.Vector4(0, 0, 1 / 3, 0.5);
      faceUV[4] = new BABYLON.Vector4(1 / 3, 0.5, 2 / 3, 1);
      faceUV[5] = new BABYLON.Vector4(2 /3, 0.5, 1, 1);
  
      options = { ...options, faceUV: faceUV, wrap: true };
  }

  // Create the box with the correct options
  const player = BABYLON.MeshBuilder.CreateBox(`player_${id}`, options, scene);
  const positionOnGround = player.getBoundingInfo().boundingBox.extendSize.y;
  player.position = new BABYLON.Vector3(position.x, positionOnGround, position.z);
  player.speed = 0.3;
  player.rotationSpeed = 0.05;
  player.checkCollisions = true;
  player.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5);
  const ellipsoidVisualizer = BABYLON.MeshBuilder.CreateSphere("ellipsoidVisualizer", { diameter: 1.2 }, scene);
  ellipsoidVisualizer.position = player.position;  // Position it the same as the cube
  ellipsoidVisualizer.material = new BABYLON.StandardMaterial("ellipsoidMaterial", scene);
  ellipsoidVisualizer.material.diffuseColor = new BABYLON.Color3(1, 0, 0);  // Red color for visibility

  player.material = new BABYLON.StandardMaterial("Mat", scene);

  // if (mat === "crate") {
  //     player.material.diffuseTexture = new BABYLON.Texture("textures/crate.png", scene);
  //     player.material.diffuseTexture.hasAlpha = true;
  // }

  // if (mat === "face") {
  //     player.material.diffuseTexture = new BABYLON.Texture("textures/face.jpg", scene);
  //     player.material.diffuseTexture.hasAlpha = true;
  //     player.rotation.y = Math.PI;
  // }

  if(scene) {
    scene.registerBeforeRender(function () {
      if (ground && !player.intersectsMesh(ground)) {
          player.position.y -= 0.3; 
      }
      ellipsoidVisualizer.position = player.position;
  });
  }


  return player;
}

const addFollowingCamera = (player, scene) => {
  const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 5, -10), scene);
  camera.lockedTarget = player;
  camera.radius = 10;
  camera.heightOffset = 5;

  camera.rotationOffset = 180; // Always behind the player

  camera.cameraAcceleration = 0.05;  // How fast the camera moves to target
  camera.maxCameraSpeed = 10;        // Max speed camera can move

  // 🛑 Prevent excessive zooming in/out
  camera.lowerRadiusLimit = 5;  // Minimum distance from the player
  camera.upperRadiusLimit = 15; // Maximum distance (prevents scrolling too far away)

  // 🛑 Prevent vertical movement from going too high or low
  camera.lowerHeightOffsetLimit = 3;  // Minimum height (prevents looking under the player)
  camera.upperHeightOffsetLimit = 7;  // Maximum height (prevents extreme overhead views)

  // 🛑 Prevent the camera from spinning too far (optional)
  // camera.lowerRotationOffsetLimit = 120; // Prevents too much side rotation
  // camera.upperRotationOffsetLimit = 240; // Prevents extreme angles
  camera.lowerRotationOffsetLimit = 180; // Lock rotation
  camera.upperRotationOffsetLimit = 180;

  scene.getEngine().getRenderingCanvas().addEventListener("pointerdown", () => {
      camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
  });

  scene.activeCamera = camera; 

  return camera;
}

const enablePlayerMovement = (player, scene, socket) => {
  const inputMap = {};
  scene.actionManager = new BABYLON.ActionManager(scene);

  // Listen for keyboard input
  scene.onKeyboardObservable.add(({ event, type }) => {
      inputMap[event.key.toLowerCase()] = type === BABYLON.KeyboardEventTypes.KEYDOWN;
  });

  scene.onBeforeRenderObservable.add(() => {
      let moved = false;
      let rotationBefore = player.rotation.y;
  
      if (inputMap["w"]) {
          const forwardDirection = player.forward.clone();
          forwardDirection.scaleInPlace(player.speed);
          player.moveWithCollisions(forwardDirection);
          moved = true;
      }
      if (inputMap["a"]) {
          player.rotation.y -= player.rotationSpeed; // Rotate left
          moved = true;
      }
      if (inputMap["d"]) {
          player.rotation.y += player.rotationSpeed; // Rotate right
          moved = true;
      }
  
      let rotationAfter = player.rotation.y;
  
      if (moved) {
          console.log(`Player position: ${player.position.x}, ${player.position.y}, ${player.position.z}`);
          console.log(`Rotation before: ${rotationBefore}, Rotation after: ${rotationAfter}`);
          socket.emit("playerMove", {
              position: { x: player.position.x, y: player.position.y, z: player.position.z },
              rotation: player.rotation.y
          });
      }
  });
  

  return scene;
}

const addPlayer = (id, position, ground) => {
  if (!players[id]) {
      players[id] = createPlayer(scene, id, position, "face", ground);
  }
}

const startGame = () => {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);
  const socket = io();

  const { scene, ground } = createScene(engine, canvas);

  socket.on("connect", () => {
    console.log("Client connected to server");
  });

      // Handle existing players when joining
      socket.on("currentPlayers", (existingPlayers) => {
        for (let id in existingPlayers) {
            if (id !== socket.id) {
                addPlayer(id, existingPlayers[id].position);
            }
        }
    });

    // Handle new player joining
    socket.on("newPlayer", ({ id, position }) => {
        if (!players[id]) {
            addPlayer(id, position);
        }
    });

    // // Handle player movement updates
    // socket.on("updatePlayer", ({ id, position, rotation }) => {
    //     if (players[id]) {
    //         players[id].position = new BABYLON.Vector3(position.x, position.y, position.z);
    
    //         // Ensure rotation is properly applied
    //         players[id].rotationQuaternion = null; // Disable quaternion control
    //         players[id].rotation.y = rotation;  // Apply received rotation
    //     }
    // });

    // // Handle player disconnect
    // socket.on("removePlayer", (id) => {
    //     if (players[id]) {
    //         players[id].dispose();
    //         delete players[id];
    //     }
    // });

  if (!players[socket.id]) {
    players[socket.id] = createPlayer(scene, socket.id, {}, "face", ground);
    // enablePlayerMovement(players[socket.id], scene, socket);
    // addFollowingCamera(players[socket.id], scene);
  }

  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine.resize());
};

document.addEventListener("DOMContentLoaded", startGame);
