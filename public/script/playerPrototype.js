const PlayerPrototype = {
    create(scene, socket) {
        const player = BABYLON.MeshBuilder.CreateBox(`player_${socket.id}`, { size: 1 }, scene);
        player.position.y = 0.5;
        player.speed = 0.3;
        player.rotationSpeed = 0.05;
        //store scene
        player.scene = scene;
        player.socket = socket;
        let inputMap = {};

        // Attach canMove to the player object itself
        player.canMove = function() {
            this.scene.actionManager = new BABYLON.ActionManager(this.scene);

            // Listen for keyboard input
            this.scene.onKeyboardObservable.add(({ event, type }) => {
                inputMap[event.key.toLowerCase()] = type === BABYLON.KeyboardEventTypes.KEYDOWN;
            });

            // Movement logic on each render frame
            this.scene.onBeforeRenderObservable.add(() => {
                let moved = false;

                if (inputMap["w"]) {
                    // const forward = this.getDirection(BABYLON.Axis.Z).scale(this.speed);
                    const forwardDirection = this.forward.clone();
                    forwardDirection.scaleInPlace(this.speed);

                    // const forward = this.forward.scale(this.speed);
                    this.moveWithCollisions(forwardDirection);
                    moved = true;
                }
                if (inputMap["a"]) {
                    this.rotate(BABYLON.Vector3.Up(), -this.rotationSpeed);
                    moved = true;
                }
                if (inputMap["d"]) {
                    this.rotate(BABYLON.Vector3.Up(), this.rotationSpeed);
                    moved = true;
                }

                // Optionally, send the position to the server
                if (moved) {
                    socket.emit("playerMove", {
                        position: { x: this.position.x, y: this.position.y, z: this.position.z },
                        rotation: this.rotation.y,
                    });
                }
            });
        };

        player.addFollowingCamera = function(canvas) {
            // Create FollowCamera
            const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 5, -10), this.scene);
            camera.lockedTarget = player;
            camera.radius = 10; // Adjust camera distance
            camera.heightOffset = 5; // Adjust camera height
            camera.rotationOffset = 180; // Adjust camera rotation
            this.scene.activeCamera = camera; // Set the camera to be active

            // Attach camera to the canvas
           this.scene.getEngine().getRenderingCanvas().addEventListener("pointerdown", () => {
                camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
            });
        };

        return player;
    }
};

function clonePrototype(proto) {
    function F() {}
    F.prototype = proto;
    return new F();
}

const playerPrototype = clonePrototype(PlayerPrototype);
