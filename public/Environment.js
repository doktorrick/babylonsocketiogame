
class Environment {
    constructor(canvas) {
        if (!canvas) {
            throw new Error("canvas is required to create an Environment.");
        }
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = this.createScene();
        this.socketManager = this.createSocketManager(this);
        this.otherPlayers = {};
        this.defaultPlayerModel = {
            modelPath: "/resources/models/",
            scale: 10.5
        };

        // Auto-initialize the environment setup
        this.addDefaultLight();
        this.addDefaultCamera();
        this.addYAxis();
        this.addDefaultGround();
        this.addDefaultSkybox();
        this.createPlayer();
        this.render(); // Start rendering automatically
    }

    createScene() {
        return new BABYLON.Scene(this.engine);
    }

    createSocketManager(socketManager) {
        return new SocketManager(socketManager);
    }


    addDefaultLight() {
        const light1 = new BABYLON.HemisphericLight(
            "light1",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        light1.intensity = 0.6;
        light1.specular = BABYLON.Color3.Black();

        const light2 = new BABYLON.DirectionalLight(
            "dir01",
            new BABYLON.Vector3(0.5, -0.5, -1.0),
            this.scene
        );
        light2.position = new BABYLON.Vector3(0, 5, 5);
        light2.intensity = 0.2;
    }

    addDefaultCamera() {
        this.camera = new BABYLON.ArcRotateCamera(
            "camera1",
            (3 * Math.PI) / 2,
            Math.PI / 4,
            50,
            new BABYLON.Vector3(0, 0, 0),
            this.scene
        );
        this.scene.activeCamera = this.camera;
        this.scene.activeCamera.attachControl(this.canvas, true);
    }

    addYAxis() {
        const size = 6;
        const axisY = BABYLON.MeshBuilder.CreateLines("axisY", {
            points: [
                new BABYLON.Vector3.Zero(),
                new BABYLON.Vector3(0, size, 0),
                new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
                new BABYLON.Vector3(0, size, 0),
                new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
            ]
        });
        axisY.color = new BABYLON.Color3(0, 1, 0);
    }

    addDefaultGround() {
        const ground = BABYLON.MeshBuilder.CreateGround(
            "ground",
            { width: 600, height: 600 },
            this.scene
        );
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture(
            "textures/wood.jpg",
            this.scene
        );
        groundMaterial.diffuseTexture.uScale = 30;
        groundMaterial.diffuseTexture.vScale = 30;
        ground.material = groundMaterial;
    }

    addDefaultSkybox() {
        const skybox = BABYLON.MeshBuilder.CreateBox(
            "skyBox",
            { size: 3500.0 },
            this.scene
        );
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
            "textures/TropicalSunnyDay",
            this.scene
        );
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
    }

    createPlayer(modelPath, scale) {
        this.player = new Player(this.scene, this.camera, modelPath, scale, this.socketManager); 
        return this;
    }

    //#region Player
    addOtherPlayer(playerId, playerData) {
        console.log(`Adding existing player: ${playerId}`);
    
        this.otherPlayers[playerId] = new Player(
            this.scene,
            this.camera,
            this.defaultPlayerModel.modelPath,
            this.defaultPlayerModel.scale,
            this.socketManager,
            playerId,
            playerData
        );
    
        // Ensure the player is correctly positioned
        this.otherPlayers[playerId].hero.position = new BABYLON.Vector3(
            playerData.position.x,
            playerData.position.y,
            playerData.position.z
        );
    }

    //player can see the new player enter.
    addPlayerJoin(playerId, playerData) {
        console.log(`New player joined: ${playerId}`);
    
        if (!this.otherPlayers[playerId]) {
            this.otherPlayers[playerId] = new Player(
                this.scene, 
                this.camera, 
                this.defaultPlayerModel.modelPath, 
                this.defaultPlayerModel.scale, 
                this.socketManager,
                playerId,
                playerData
            );
        }
    
        this.otherPlayers[playerId].hero.position = new BABYLON.Vector3(
            playerData.position.x, 
            playerData.position.y, 
            playerData.position.z
        );
    
        // 🔥 Notify the new player about all existing players
        for (let existingPlayerId in this.otherPlayers) {
            if (existingPlayerId !== playerId) {
                this.socketManager.sendToPlayer(playerId, {
                    type: "existingPlayer",
                    id: existingPlayerId,
                    position: this.otherPlayers[existingPlayerId].hero.position,
                });
            }
        }
    }

    removePlayer(playerId) {
        if (this.otherPlayers[playerId]) {
            this.otherPlayers[playerId].hero.dispose();
            delete this.otherPlayers[playerId];
        }
    }

    // updatePlayerPositionAndAnimation(playerData) {
    //     const player = this.otherPlayers[playerData.id];
    //     if (player) {
    //         player.hero.position = new BABYLON.Vector3(playerData.position.x, playerData.position.y, playerData.position.z);
    //         player.hero.rotation.y = playerData.rotation;

    //         // Update animation state for other players
    //         // if (player.animations.walk && playerData.animationTime) {
    //         //     player.animations.walk.runtimeAnimations[0].currentFrame = playerData.animationTime;
    //         // }
    //     }
    // }
    //#endregion


    render() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }
}


