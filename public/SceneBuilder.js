class SceneBuilder {
    constructor(canvas) {
        if (!canvas) {
          throw new Error("canvas is required to create a SceneBuilder.");
        }
        this.engine = new BABYLON.Engine(canvas, true);;
        this.canvas = canvas;
        this.inputMap = [];
        // this.camera;
        this.scene = this.createScene();
    }

    createScene() {
        return new BABYLON.Scene(this.engine);
    }

    addDefaultLight() {
        var light = new BABYLON.HemisphericLight(
          "light1",
          new BABYLON.Vector3(0, 1, 0),
          this.scene
        );
        light.intensity = 0.6;
        light.specular = BABYLON.Color3.Black();
      
        var light2 = new BABYLON.DirectionalLight(
          "dir01",
          new BABYLON.Vector3(0.5, -0.5, -1.0),
          this.scene
        );
        light2.position = new BABYLON.Vector3(0, 5, 5);
        light2.intensity = 0.2;
        return this
    };

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
        // camera1.lowerRadiusLimit = 2;
        // camera1.upperRadiusLimit = 10;
        // camera1.wheelDeltaPercentage = 0.01;
      
        // // prevent less than
        // camera1.lowerBetaLimit = 0.1;
        // camera1.lowerRadiusLimit = 150;
      
        // camera1.upperBetaLimit = (Math.PI / 2) * 0.99;
        return this;
    };

    makeTextPlane = (text, color, size) => {
      const dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, this.scene, true);
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color , "transparent", true);
      const plane = new BABYLON.MeshBuilder.CreatePlane("TextPlane", {size, updateable: true}, this.scene);
      plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", this.scene);
      plane.material.backFaceCulling = false;
      plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
      plane.material.diffuseTexture = dynamicTexture;
      return plane;
    };

    addYAxis() {
      const size = 6;
      const axisY = BABYLON.MeshBuilder.CreateLines("axisY", { points:[
        new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), 
        new BABYLON.Vector3( -0.05 * size, size * 0.95, 0), 
        new BABYLON.Vector3(0, size, 0), 
        new BABYLON.Vector3( 0.05 * size, size * 0.95, 0)
      ]});
      axisY.color = new BABYLON.Color3(0, 1, 0);
      const yChar = this.makeTextPlane("Y", "green", size / 10);
      yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
      return this;
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
      return this;
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
        return this;
    };

    addCharacter(modelPath, scale) {
      const camera = this.scene.activeCamera;
      this.player = new Player(this.scene, this.camera, modelPath, scale); 
      return this;
    }

    addEnemy(modelPath, scale, position, patrolRadius) {
      this.enemy = new Enemy(this.scene, modelPath, position, scale, patrolRadius);
      return this;
    }

    render() {
        this.engine.runRenderLoop(() => {
          this.scene.render();
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

     
}