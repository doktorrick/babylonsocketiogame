document.addEventListener("DOMContentLoaded", startGame);

function createPlayer(scene, id, position = { x: 0, y: 0.5, z: 0 }) {
    const player = BABYLON.MeshBuilder.CreateBox(`player_${id}`, { size: 1 }, scene);
    player.position = new BABYLON.Vector3(position.x, position.y, position.z);
    player.speed = 0.3;
    player.rotation.y = 0;
    player.rotationSpeed = 0.05;
    return player;
}

function enablePlayerMovement(player, scene, socket) {
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

function addFollowingCamera(player, scene) {
    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 5, -10), scene);
    camera.lockedTarget = player;
    camera.radius = 10;
    camera.heightOffset = 5;
    camera.rotationOffset = 180;

    scene.getEngine().getRenderingCanvas().addEventListener("pointerdown", () => {
        camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
    });

    return camera;
}

function startGame() {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);
    const socket = io();
    const players = {}; // Stores all player objects

    const scene = new BABYLON.Scene(engine);
    skybox.add(scene);
    ground.add(scene);
    light.add(scene);

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

    // Handle player movement updates
    socket.on("updatePlayer", ({ id, position, rotation }) => {
        if (players[id]) {
            players[id].position = new BABYLON.Vector3(position.x, position.y, position.z);
    
            // Ensure rotation is properly applied
            players[id].rotationQuaternion = null; // Disable quaternion control
            players[id].rotation.y = rotation;  // Apply received rotation
        }
    });

    // Handle player disconnect
    socket.on("removePlayer", (id) => {
        if (players[id]) {
            players[id].dispose();
            delete players[id];
        }
    });

    function addPlayer(id, position) {
        if (!players[id]) {
            players[id] = createPlayer(scene, id, position);
        }
    }

    if (!players[socket.id]) {
        players[socket.id] = createPlayer(scene, socket.id);
        enablePlayerMovement(players[socket.id], scene, socket);
        addFollowingCamera(players[socket.id], scene);
    }

    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener("resize", () => engine.resize());
}
