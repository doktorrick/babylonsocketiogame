const players = {};

const lastFrames = {}; // Store last received frame
const lastTimestamps = {}; // Store last received timestamp
let isAnimatingAttack = false;

const vecToLocal = (vector, mesh) => {
    var m = mesh.getWorldMatrix();
    var v = BABYLON.Vector3.TransformCoordinates(vector, m);
    return v;		 
}

const castRay = (mesh, scene) => {       
    // var origin =  mesh.position;

    // var forward = new BABYLON.Vector3(0,0,1);		
    // forward = vecToLocal(forward, mesh);

    // var direction = forward.subtract(origin);
    // direction = BABYLON.Vector3.Normalize(direction);

    // var length = 10;

    // var ray = new BABYLON.Ray(origin, direction, length);
    var forward = new BABYLON.Vector3(0, 0, 1);		
    var worldForward = vecToLocal(forward, mesh); // แปลงเป็นเวกเตอร์ในโลกจริง

    var direction = worldForward.subtract(mesh.position).normalize();
    
    var origin = mesh.position.add(direction.scale(2)); // ขยับจุดเริ่มต้นไปข้างหน้า 2 หน่วย
    
    var length = 10;
    var ray = new BABYLON.Ray(origin, direction, length);
    // let rayHelper = new BABYLON.RayHelper(ray);		
    // rayHelper.show(scene);		

    var hit = scene.pickWithRay(ray);
    // console.log(hit.pickWithRay)

    if (hit.pickedMesh){
    //    hit.pickedMesh.scaling.y += 0.2;
        console.warn(`HIT: ${hit.pickedMesh.name}`)
    }
}

const createRedBox = (scene) => {
    var box = BABYLON.MeshBuilder.CreateBox("brox_red", { size: 2.0 }, scene);
    box.position.x = 9;
    box.scaling.z = 1;

    var matBox = new BABYLON.StandardMaterial("matBox", scene);
    matBox.diffuseColor = new BABYLON.Color3(1.0, 0.1, 0.1);
    box.material = matBox;
    box.isPickable = false;
    box.checkCollisions = true;

    // Define the function separately
    const beforeRenderFunction = function () {
        castRay(box, scene);
    };

    // Register it
    scene.registerBeforeRender(beforeRenderFunction);

    // Return the function reference if you want to unregister it later
    return { box, beforeRenderFunction };
}; //scene.unregisterBeforeRender(beforeRenderFunction);


const createSword = (player, scene) => {
    const sword = BABYLON.MeshBuilder.CreateBox(`sword_xxx`, { height: 0.1, width: 0.1, depth: 3 }, scene);
    sword.position = new BABYLON.Vector3(0 , 0.25 , 1); 
    sword.setPivotPoint(new BABYLON.Vector3(0, 0, -0.15));
    // sword.checkCollisions = true;
      
    const yaw = 0;  // Turn slightly to the right
    const pitch = Math.PI / 2;  // Tilt forward
    const roll = 0;  // No roll
    // sword.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(yaw, pitch, roll);
    // sword.rotation = new BABYLON.Vector3(yew, pitch, roll);
    // sword.rotation.y = yaw;
    // sword.rotation.x = pitch;
    // sword.rotation.z = roll;

    sword.rotation.x = Math.PI / 2; // Tilt forward 90 degrees (pointing forward)
    sword.rotation.y = 0; // No yaw
    sword.rotation.z = 0; // No roll
    
    sword.material = new BABYLON.StandardMaterial("swordMaterial", scene);
    sword.material.diffuseColor = new BABYLON.Color3(1, 0, 0); 
    sword.material.backFaceCulling = false;
    sword.isVisible = true;
    sword.parent = player; 


    // Create a cube at the end of the sword
    const cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 0.2 }, scene);
    cube.position = new BABYLON.Vector3(0, 0, -1.5); // Position at the end of the sword
    cube.material = new BABYLON.StandardMaterial("cubeMaterial", scene);
    cube.material.diffuseColor = new BABYLON.Color3(0, 0, 1); // Blue color
    cube.parent = sword; // Parent the cube to the sword
    
    const axes = new BABYLON.AxesViewer(scene, 1);
    axes.xAxis.parent = sword;
    axes.yAxis.parent = sword;
    axes.zAxis.parent = sword;
    // const origin = sword.position.add(new BABYLON.Vector3(0, 0, 1.5));  // 1.5 is half of depth (3)
    // const length = 20;
    // let forward = new BABYLON.Vector3(1,0,0);
    // forward = vecToLocal(forward, sword);

    // var direction = forward.subtract(origin);
    // direction = BABYLON.Vector3.Normalize(direction);
    // const ray = new BABYLON.Ray(origin, direction, length);
    // let rayHelper = new BABYLON.RayHelper(ray);		
    // // rayHelper.attachToMesh(origin, BABYLON.Vector3.Forward(), new BABYLON.Vector3(0, 0, 1), 20);

    // rayHelper.show(scene);



    return sword;
}

// const performMeleeAttack = (player, socket) => {
//     if (!player.sword) return;

//     const frameRate = 30;
//     const animationX = new BABYLON.Animation(
//         "swordSwing",
//         "rotation.x",
//         frameRate,
//         BABYLON.Animation.ANIMATIONTYPE_FLOAT,
//         BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
//     );

//     animationX.setKeys([
//         { frame: 0, value: Math.PI },
//         { frame: 30, value: Math.PI / 2 }
//     ]);

//     player.sword.animations = [animationX];

//     const scene = player.getScene();
//     const animatable = scene.beginAnimation(player.sword, 0, 30, false);

//     if (!animatable) {
//         console.error("Animation failed to start");
//         return;
//     }

//     // setTimeout(() => {
//     //     console.log("stopppp");
//     //     animatable.stop();
//     // }, 5000);

//     const animationObserver = scene.onBeforeRenderObservable.add(() => {
//         if (animatable.isStopped) {
//             scene.onBeforeRenderObservable.remove(animationObserver);
//             console.log("Animation finished.");
//             return;
//         }

//         const currentFrame = animatable.masterFrame;
//         console.warn(`Info Sent frame: ${currentFrame}, isAnimationFinished: ${animatable.isStopped}, rotationX: ${player.sword.rotation.x}`);

//         if(currentFrame <= 30) {
//             console.warn(currentFrame);
//             socket.emit("playerAnimation", {
//                 playerId: socket.id,
//                 animationName: "swordSwing",
//                 frame: currentFrame,
//                 rotationX: player.sword.rotation.x,
//                 timestamp: Date.now()
//             });
//         }
   
//     });
// };

const performMeleeAttack = (player, socket) => {
    if (!player.sword) return;
    isAnimatingAttack = true;

    const frameRate = 30;
    const animationX = new BABYLON.Animation(
        "swordSwing",
        "rotation.x",
        frameRate,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    animationX.setKeys([
        { frame: 0, value: Math.PI },
        { frame: 30, value: Math.PI / 2 }
    ]);

    player.sword.animations = [animationX];

    const scene = player.getScene();
    const animatable = scene.beginAnimation(player.sword, 0, 30, false);

    if (!animatable) {
        console.error("Animation failed to start");
        return;
    }

    const startTime = Date.now(); // Record the start time of the animation
    let isAnimationFinished = false; // Track whether the animation has finished

    const animationObserver = scene.onBeforeRenderObservable.add(() => {
        if (isAnimationFinished) {
            // If the animation is already finished, do nothing
            return;
        }

        // Calculate the current frame based on elapsed time
        const elapsedTime = (Date.now() - startTime) / 1000; // Convert to seconds
        const currentFrame = Math.min(Math.floor(elapsedTime * frameRate), 30); // Cap at 30 frames

        // console.warn(`Info Sent frame: ${currentFrame}, isAnimationFinished: ${isAnimationFinished}, rotationX: ${player.sword.rotation.x}`);
        console.warn(`Elapsed Time: ${elapsedTime}, Current Frame: ${currentFrame}, isAnimationFinished: ${isAnimationFinished}`);

        if (currentFrame <= 30) {
            socket.emit("playerAnimation", {
                playerId: socket.id,
                animationName: "swordSwing",
                frame: currentFrame,
                rotationX: player.sword.rotation.x,
                timestamp: Date.now()
            });
        }

        // Check if the animation has reached the end
        if (currentFrame >= 30 && !isAnimationFinished) {
            isAnimationFinished = true; 
            isAnimatingAttack = false;
            scene.onBeforeRenderObservable.remove(animationObserver); // Remove the observer
            console.warn("Animation finished.");
            console.warn(`Elapsed Time: ${elapsedTime}, Current Frame: ${currentFrame}, isAnimationFinished: ${isAnimationFinished}`);

        }
    });
};

const isCharacterGrounded = (characterMesh, ground, scene) => {
    const origin = characterMesh.position.clone();
    const direction = new BABYLON.Vector3(0, -1, 0); // Downward ray
    const length = 1.1; // Slightly longer than half character height

    const ray = new BABYLON.Ray(origin, direction, length);
    const hit = scene.pickWithRay(ray, (mesh) => mesh === ground);
    console.log(`HIT: ${hit.hit}`)
    return hit.hit; // Returns true if ground is detected
}

const createHealthBar = (player, scene) => {
    const healthBar = BABYLON.MeshBuilder.CreatePlane("healthBar", { width: 1, height: 0.1 }, scene);
    healthBar.material = new BABYLON.StandardMaterial("healthBarMaterial", scene);
    healthBar.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
    
    // Make it visible from both sides
    healthBar.material.backFaceCulling = false;

    // Make it always face the camera
    healthBar.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    healthBar.position.y = 1.5;
    healthBar.parent = player;

    return healthBar;
};

const createHitbox = (player, scene) => {
    const hitbox = BABYLON.MeshBuilder.CreateSphere("ellipsoidVisualizer", { diameter: 0.6 }, scene);
    hitbox.material = new BABYLON.StandardMaterial("ellipsoidMaterial", scene);
    hitbox.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
    // hitbox.checkCollisions = true;
    hitbox.parent = player;



    return hitbox;
}

const createPlayer = (scene, id, position = { x: 0, y: 0, z: 0, rotation: { } }, mat = "crate", ground, socket) => {
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
    const groundHeight = ground ? ground.getBoundingInfo().boundingBox.maximum.y : 0;
    const positionOnGround = player.getBoundingInfo().boundingBox.extendSize.y;
    player.position = new BABYLON.Vector3(position.x, groundHeight + positionOnGround, position.z);
    player.speed = 0.3;
    player.rotationSpeed = 0.05;
    player.showBoundingBox = true;
    player.checkCollisions = true;
    player.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5);
    player.material = new BABYLON.StandardMaterial("Mat", scene);
    player.textureApplied = false;

    if (!player.textureApplied) {
        if (mat === "crate") {
            player.material.diffuseTexture = new BABYLON.Texture("textures/crate.png", scene);
            player.material.diffuseTexture.hasAlpha = true;
            player.textureApplied = true;  // Mark texture as applied
        }

        if (mat === "face") {
            player.material.diffuseTexture = new BABYLON.Texture("textures/face.jpg", scene);
            player.material.diffuseTexture.hasAlpha = true;
            player.rotation.y = Math.PI;
            player.textureApplied = true;  // Mark texture as applied
        }
    }

  const healthBar = createHealthBar(player);
  player.health = 100; // Initial health
  player.maxHealth = 100; // Maximum health

//   const axes = new BABYLON.AxesViewer(scene, 1);
//   axes.xAxis.parent = player;
//   axes.yAxis.parent = player;
//   axes.zAxis.parent = player;

  const updateHealthBar = (health) => {
      const healthPercentage = health / player.maxHealth;
      healthBar.scaling.x = healthPercentage; // Scale the health bar based on health
  };

//   scene.onBeforeRenderObservable.add(() => {
//         if (isCharacterGrounded(player, ground, scene)) {
//             console.log("Character is on the ground");
//         } else {
//             console.log("Character is in the air");
//         }
//   });

scene.registerBeforeRender(function () {
    castRay(player, scene);
});

  scene.registerBeforeRender(function () {
    if (ground && player) {
        if (ground instanceof BABYLON.Mesh && player instanceof BABYLON.Mesh) {
            if (!player.intersectsMesh(ground)) {
                player.position.y -= 0.1;  // Gravity effect
                socket.emit("playerMove", {
                    position: { x: player.position.x, y: player.position.y, z: player.position.z },
                    rotation: player.rotation.y
                });
            } else {
                // console.info("Player is not touching ground");
            }
        }
    }
 
  });

  return player;
}

const addFollowingCamera = (player, scene) => {
  const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 5, -10), scene);
  camera.lockedTarget = player;
  camera.radius = 10;
  camera.heightOffset = 5;

  camera.rotationOffset = 180; // Always behind the player

  camera.cameraAcceleration = 0.05;  // How fast the camera moves to target
  camera.maxCameraSpeed = 100;        // Max speed camera can move

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
      let isAttacking = false;

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
      if (inputMap[" "]) { 
        isAttacking = true;
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
      if(isAttacking) {
        // alert(isAnimatingAttack)
        !isAnimatingAttack && performMeleeAttack(player, socket);
      }
  });
  

  return scene;
}

const debugUI = (scene) => {
  scene.debugLayer.show();
//   console.log(BABYLON.Engine.Version)
  return scene;
}

const startGame = () => {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);
  const socket = io();

  const { scene, ground } = createScene(engine, canvas);

    // Slime body (a smooth, semi-transparent sphere)
    const slime = BABYLON.MeshBuilder.CreateSphere("slime", { diameter: 2 }, scene);
    slime.position = new BABYLON.Vector3(3, 2, 0);
    const slimeMaterial = new BABYLON.StandardMaterial("slimeMat", scene);
    // slime.checkCollisions = true;

    slimeMaterial.diffuseColor = new BABYLON.Color3(0.3, 1, 0.3); // Green color
    slimeMaterial.alpha = 0.7; // Slight transparency
    slime.material = slimeMaterial;

    // Jiggle animation
    scene.registerBeforeRender(() => {
        slime.scaling.y = 1 + 0.1 * Math.sin(performance.now() * 0.005);
    });

    // // Soft-body bouncing effect
    let t = 0;
    scene.registerBeforeRender(() => {
        t += engine.getDeltaTime() * 0.005;
        slime.scaling.y = 1 + 0.1 * Math.sin(t);  // Vertical squish
        slime.scaling.x = slime.scaling.z = 1 - 0.07 * Math.sin(t);  // Horizontal stretch
    });

    
//   debugUI(scene);

    // const { box, beforeRenderFunction } = createRedBox(scene);
    // scene.unregisterBeforeRender(beforeRenderFunction);

    // Get a picking ray from the camera
    // const pickResult = scene.pick(scene.pointerX, scene.pointerY);

    // if (pickResult.hit) {
    //     console.log("Picked mesh:", pickResult.pickedMesh);
    // }

  socket.on("connect", () => {
    console.log("Client connected to server");
    const initialPosition = { x: 0, y: 0, z: 0, rotation: { y: -Math.PI / 2 } };
    // let playerId = socket.id || '001';
    if(!players[socket.id]) {
        players[socket.id] = createPlayer(scene, socket.id, initialPosition, "face", ground, socket);
        players[socket.id].sword = createSword(players[socket.id], scene);
        createHitbox(players[socket.id], scene);
        enablePlayerMovement(players[socket.id], scene, socket);
        addFollowingCamera(players[socket.id], scene);
        if (!players[socket.id]) {
            console.error("Failed to create player");
            return;
        }
    }

    socket.emit("playerJoin", {
        id: socket.id,
        position: initialPosition,
        rotation: initialPosition.rotation.y,
    })

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

  // Handle player movement updates
  socket.on("updatePlayer", ({ id, position, rotation }) => {
      if (players[id]) {
          players[id].position = new BABYLON.Vector3(position.x, position.y, position.z);
          players[id].rotationQuaternion = null; // Disable quaternion control
          players[id].rotation.y = rotation;  // Apply received rotation
      }
  });

  socket.on("playerAnimation", (data) => {
    const { playerId, animationName, frame, rotationX, timestamp } = data;

    // Find the player whose animation is being updated
    const player = players[playerId];
    if (!player || !player.sword) {
        console.error(`Player ${playerId} or their sword not found.`);
        return;
    }

    // Update the sword's rotation based on the received data
    player.sword.rotation.x = rotationX;

    // Optionally, you can log the received frame and timestamp
    console.log(`Received frame: ${frame} for player ${playerId} at ${new Date(timestamp).toLocaleTimeString()}`);
});

  // Handle player disconnect
  socket.on("removePlayer", (id) => {
      if (players[id]) {
        players[id].dispose();
        delete players[id];
      }
  });

  const addPlayer = (id, position, ground) => {
    if (!players[id]) {
        players[id] = createPlayer(scene, id, position, "face", ground);
        players[id].hitbox = createHitbox(players[id], scene); 
        players[id].sword = createSword(players[id], scene);
        if (!players[id]) {
            console.error("Failed to create player");
            return;
        }
    }
  }


  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine.resize());
};

document.addEventListener("DOMContentLoaded", startGame);
