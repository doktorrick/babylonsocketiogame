class Player {
    constructor(scene, camera, modelPath, scale, socketManager, playerId, playerData) {
        // super(socket, this);

        this.scene = scene;
        this.camera = camera;
        this.modelPath = modelPath;
        this.hero = null;
        this.animations = {};
        this.inputMap = {};

        this.heroSpeed = 1.20;
        this.heroSpeedBackwards = 0.01;
        this.heroRotationSpeed = 0.1;
        this.animating = false;
        this.scale = scale;
        this.initAnimation = true;
        this.socketManager = socketManager;

        this.playerId = playerId;
        this.playerData = playerData;
        // this.socket = socket;

        this.initInput();
        if(this.modelPath) {
            // consoe.log(`SOCKET: ${this.socket}`);
            this.loadModel();
        };

        this.setupCrosshair();
    }

    // Initialize keyboard input
    initInput() {
        this.scene.actionManager = new BABYLON.ActionManager(this.scene);
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
                const key = evt.sourceEvent.key.toLowerCase();
                this.inputMap[key] = evt.sourceEvent.type === "keydown";
            })
        );
        this.scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
                const key = evt.sourceEvent.key.toLowerCase();
                this.inputMap[key] = evt.sourceEvent.type === "keydown";
            })
        );
    }

    setFollowingCamera() {
        if (!this.hero) {
            console.error("Hero not initialized yet.");
            return;
        }
        this.camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 5, -10), this.scene);
        this.camera.lockedTarget = this.hero; 
        this.camera.radius = 60; 
        this.camera.heightOffset = 25; 
        this.camera.rotationOffset = 180; 
        this.scene.activeCamera = this.camera;

        // Add mouse movement to control camera rotation
        this.scene.onPointerMove = (evt) => {
            if (this.scene.activeCamera === this.camera) {
                const deltaX = evt.movementX || evt.mozMovementX || evt.webkitMovementX || 0;
                const deltaY = evt.movementY || evt.mozMovementY || evt.webkitMovementY || 0;

                this.camera.alpha -= deltaX * 0.01; // Horizontal rotation
                this.camera.beta -= deltaY * 0.01; // Vertical rotation
            }
        };
    }

    setupCrosshair() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const crosshair = new BABYLON.GUI.Ellipse();
        crosshair.width = "10px";
        crosshair.height = "10px";
        crosshair.color = "red";
        crosshair.thickness = 2;
        crosshair.background = "transparent";
        crosshair.top = "-20px";
        advancedTexture.addControl(crosshair);
    }

    stopAnimationAll(animationGroups) {
        if (animationGroups && animationGroups.length > 0) {
            for (let group of animationGroups) {
                group.stop(); 
            }
        }
    }

    // Load the character model
    async loadModel() {
        console.log(`loading glb...${this.modelPath}`)
        try {
            const result = await BABYLON.SceneLoader.ImportMeshAsync(
                "", // Empty string means load all meshes
                this.modelPath, // Path to the directory containing the model
                "character.glb", // Name of the model file
                this.scene // The scene to load the model into
            );
    
            const { meshes: newMeshes, animationGroups } = result;
    
            if (!newMeshes || newMeshes.length === 0) {
                console.error("Model loading failed, no meshes found.");
                return;
            }
    
            this.hero = newMeshes[0];
            if(this.playerData) {
                this.hero.position = new BABYLON.Vector3(
                    this.playerData.x, 
                    this.playerData.y, 
                    this.playerData.z,
                );
            }
            this.hero.scaling.scaleInPlace(this.scale);
            // this.hero.lookAt(new BABYLON.Vector3(0, 0, 0));
            this.setFollowingCamera();
    
            if (!this.initAnimation) {
                this.stopAnimationAll(animationGroups);
            }
    
            this.animations.walk = this.findAnimationGroupByName(animationGroups, "Walk");
    
            if (!this.animations.walk) {
                console.warn("Walk animation not found!");
            }
    
            this.setupMovement();
        } catch (error) {
            console.error("Failed to load model:", error);
            // Load a fallback model
            const fallbackResult = await BABYLON.SceneLoader.ImportMeshAsync(
                "",
                this.modelPath,
                "character.glb",
                this.scene
            );
            this.hero = fallbackResult.meshes[0];
        }
    }

    findAnimationGroupByName(animationGroups, keyword) {
        if (!animationGroups || animationGroups.length === 0) {
            console.warn("No animation groups found.");
            return null;
        }
    
        keyword = keyword.toLowerCase();
        for (let group of animationGroups) {
            const groupName = group.name.toLowerCase();
            if (groupName.includes(keyword)) {
                return group;
            }
        }
        return null;
    }

    // Handle character movement and animations
    setupMovement() {
        this.scene.onBeforeRenderObservable.add(() => {
            let keydown = false;
    
            if (this.inputMap["w"]) {
                const forwardDirection = this.hero.forward.clone();
                forwardDirection.scaleInPlace(this.heroSpeed);
                this.hero.moveWithCollisions(forwardDirection);
                keydown = true;
            }
            if (this.inputMap["a"]) {
                this.hero.rotate(BABYLON.Vector3.Up(), -this.heroRotationSpeed);
                keydown = true;
            }
            if (this.inputMap["d"]) {
                this.hero.rotate(BABYLON.Vector3.Up(), this.heroRotationSpeed);
                keydown = true;
            }
    
            // Emit position to server when moving
            // if (keydown) {
            //     this.socketManager.emitPlayerMove(
            //         this.hero.position,
            //         this.hero.rotationQuaternion || this.hero.rotation,
            //         Date.now()
            //     );
            // }
    
            // Handle animations
            if (keydown) {
                if (!this.animating) {
                    this.animating = true;
                    if (this.inputMap["w"] && this.animations.walk) {
                        this.animations.walk.start(true, 1.0, this.animations.walk.from, this.animations.walk.to, false);
                    }
                }
            } else {
                if (this.animating) {
                    this.animating = false;
                    this.animations.walk.stop();
                }
            }
        });
    }
    
    // setupMovement() {
    //     this.scene.onBeforeRenderObservable.add(() => {
    //         let keydown = false;

    //         if (this.inputMap["w"]) {
    //             const forwardDirection = this.hero.forward.clone();
    //             forwardDirection.scaleInPlace(this.heroSpeed);
    //             this.hero.moveWithCollisions(forwardDirection);
    //             keydown = true;
    //         }
    //         if (this.inputMap["a"]) {
    //             this.hero.rotate(BABYLON.Vector3.Up(), -this.heroRotationSpeed);
    //             keydown = true;
    //         }
    //         if (this.inputMap["d"]) {
    //             this.hero.rotate(BABYLON.Vector3.Up(), this.heroRotationSpeed);
    //             keydown = true;
    //         }

    //         // Handle animations
    //         if (keydown) {
    //             if (!this.animating) {
    //                 this.animating = true;
    //                 if(this.inputMap['w']) {
    //                     this.animating === false ? this.animating = true :
    //                     this.animations.walk.start(true, 1.0, this.animations.walk.from, this.animations.walk.to, false);
    //                 }
    //             }
    //         } else {
    //             if (this.animating) {
    //                 this.animating = false;
    //                 this.animations.walk.stop();
    //             }
    //         }
    //     });
    // }

    // setupAdvanceMovement() {
    //     this.scene.onBeforeRenderObservable.add(() => {
    //         let keydown = false;
    
    //         // Get the camera's forward direction (ignoring the Y-axis to keep the character upright)
    //         const cameraForward = this.camera.getForwardRay().direction;
    //         cameraForward.y = 0; // Flatten the direction to the XZ plane
    //         cameraForward.normalize();
    
    //         // Calculate the camera's right direction manually
    //         const cameraUp = new BABYLON.Vector3(0, 1, 0); // World up vector
    //         const cameraRight = BABYLON.Vector3.Cross(cameraUp, cameraForward).normalize();
    
    //         // Movement direction
    //         const moveDirection = new BABYLON.Vector3.Zero();
    
    //         if (this.inputMap["w"]) {
    //             moveDirection.addInPlace(cameraForward);
    //             keydown = true;
    //         }
    //         if (this.inputMap["s"]) {
    //             moveDirection.addInPlace(cameraForward.scale(-1));
    //             keydown = true;
    //         }
    //         if (this.inputMap["a"]) {
    //             moveDirection.addInPlace(cameraRight.scale(-1));
    //             keydown = true;
    //         }
    //         if (this.inputMap["d"]) {
    //             moveDirection.addInPlace(cameraRight);
    //             keydown = true;
    //         }
    
    //         // Normalize the move direction to prevent faster diagonal movement
    //         if (moveDirection.length() > 0) {
    //             moveDirection.normalize();
    //         }
    
    //         // Move the character
    //         if (moveDirection.length() > 0) {
    //             const moveSpeed = this.inputMap["s"] ? this.heroSpeedBackwards : this.heroSpeed;
    //             this.hero.moveWithCollisions(moveDirection.scale(moveSpeed));
    
    //             // Rotate the character to face the movement direction
    //             const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
    //             this.hero.rotation.y = BABYLON.Scalar.Lerp(this.hero.rotation.y, targetRotation, this.heroRotationSpeed);
    //         }
    
    //         // Handle animations
    //         if (keydown) {
    //             if (!this.animating) {
    //                 this.animating = true;
    //                 this.animations.walk.start(true, 1.0, this.animations.walk.from, this.animations.walk.to, false);
    //             }
    //         } else {
    //             if (this.animating) {
    //                 this.animations.walk.stop();
    //                 this.animating = false;
    //             }
    //         }
    //     });
    // }
}