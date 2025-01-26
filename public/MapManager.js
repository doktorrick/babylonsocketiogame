function MapManager(scene) {
  const createDefaultCamera1 = (canvas) => {
    var camera1 = new BABYLON.ArcRotateCamera(
      "camera1",
      (3 * Math.PI) / 2,
      Math.PI / 4,
      10,
      new BABYLON.Vector3(0, -5, 0),
      scene
    );
    scene.activeCamera = camera1;
    scene.activeCamera.attachControl(canvas, true);
    // camera1.lowerRadiusLimit = 2;
    camera1.upperRadiusLimit = 10;
    camera1.wheelDeltaPercentage = 0.01;

    // prevent less than
    camera1.lowerBetaLimit = 0.1;
    camera1.lowerRadiusLimit = 150;

    camera1.upperBetaLimit = (Math.PI / 2) * 0.99;
    return camera1;
  };

  const createDefaultSkybox = () => {
    const skybox = BABYLON.MeshBuilder.CreateBox(
      "skyBox",
      { size: 100.0 },
      scene
    );
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
      "textures/TropicalSunnyDay",
      scene
    );
    skyboxMaterial.reflectionTexture.coordinatesMode =
      BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
  };

  const createDefaultLight = () => {
    var light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    light.intensity = 0.6;
    light.specular = BABYLON.Color3.Black();

    var light2 = new BABYLON.DirectionalLight(
      "dir01",
      new BABYLON.Vector3(0.5, -0.5, -1.0),
      scene
    );
    light2.position = new BABYLON.Vector3(0, 5, 5);
    light2.intensity = 0.2;
  };

  const createDefaultGround = () => {
    var ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 600, height: 600 },
      scene
    );
    var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture(
      "textures/wood.jpg",
      scene
    );
    groundMaterial.diffuseTexture.uScale = 30;
    groundMaterial.diffuseTexture.vScale = 30;
    // groundMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0); // RGB: (0, 1, 0) is green
    ground.material = groundMaterial;
  };

  const loadMultipleMeshes = () => {
    Promise.all([
      BABYLON.SceneLoader.ImportMeshAsync(
        "",
        "./models/",
        "Soldier.glb",
        scene
      ),
      BABYLON.SceneLoader.ImportMeshAsync("", "./models/", "mutant.glb", scene),
      BABYLON.SceneLoader.ImportMeshAsync("", "./models/", "shark.glb", scene),
      BABYLON.SceneLoader.ImportMeshAsync(
        "",
        "./models/ghost/",
        "scene.gltf",
        scene
      ),
    ])
      .then(([firstResult, secondResult, thirdResult, fourthResult]) => {
        // Process the first model
        firstResult.meshes.forEach((mesh) => {
          mesh.scaling.scaleInPlace(1.1);
          const soldierAnim = scene.getAnimationGroupByName("TPose");
          soldierAnim.start(true, 1.0, soldierAnim.from, soldierAnim.to, false);
          mesh.position.x = 5; // Adjust position
        });

        // Process the second model
        secondResult.meshes.forEach((mesh) => {
          mesh.scaling.scaleInPlace(1.2);
          mesh.position.x = 10; // Adjust position
          mesh.rotation.z = (-2 * Math.PI) / 2;
        });

        thirdResult.meshes.forEach((mesh) => {
          mesh.scaling.scaleInPlace(1);
          mesh.position.x = 15; // Adjust position
          mesh.rotation.y = (-2 * Math.PI) / 2;
        });

        fourthResult.meshes.forEach((mesh) => {
          mesh.scaling.scaleInPlace(1);
        });
      })
      .catch((error) => {
        console.error("Error loading models:", error);
      });
  };

  return {
    createDefaultSkybox,
    createDefaultGround,
    loadMultipleMeshes,
    createDefaultLight,
    createDefaultCamera1,
  };
}
