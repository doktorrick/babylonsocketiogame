const createSkybox = (scene) => {
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 3500.0 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
  
    const reflectionTexture = new BABYLON.CubeTexture("../textures/TropicalSunnyDay", scene);
    skyboxMaterial.reflectionTexture = reflectionTexture;
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    return skybox
  };
  
  const createGround = (scene) => {
    // const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 30}, scene);
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width:20, height: 20, depth: 6 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    const groundTexture = new BABYLON.Texture("../textures/wood.jpg", scene);
    groundMaterial.diffuseTexture = groundTexture;
    groundMaterial.diffuseTexture.uScale = 30;
    groundMaterial.diffuseTexture.vScale = 30;
    ground.material = groundMaterial;
    ground.checkCollisions = true;

    return ground;
  };

  const createCamera = (scene, canvas) => {
    const camera = new BABYLON.ArcRotateCamera("camera1", (3 * Math.PI) / 2, Math.PI / 4, 50, new BABYLON.Vector3(0, 0, 0), scene);
    scene.activeCamera = camera;
    camera.attachControl(canvas, true);

    return scene
  };
  
  const createLights = (scene) => {
    const light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light1.intensity = 0.6;
    light1.specular = BABYLON.Color3.Black();
  
    const light2 = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0.5, -0.5, -1.0), scene);
    light2.position = new BABYLON.Vector3(0, 5, 5);
    light2.intensity = 0.2;

    return light1
  };
  
  const createScene = (engine, canvas) => {
    const scene = new BABYLON.Scene(engine);
    createSkybox(scene);
    const ground = createGround(scene);
    createLights(scene);
    createCamera(scene, canvas);
  
    return { scene, ground };
  };