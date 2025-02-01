// const compose = (...functions) => (initialValue) =>
//   functions.reduceRight((value, func) => func(value), initialValue);

// const pipe = (...functions) => (initialValue) =>
//   functions.reduce((value, func) => func(value), initialValue);

const createCube = (entity, ID="001") => {
  const { scene } = entity;
  if (!scene) {
    throw new Error("Scene is required to create a cube.");
  }
  BABYLON.MeshBuilder.CreateBox(`player_${ID}`, { size: 1 }, scene);
  return entity;
}

const addDefaultSkybox = (entity) => {
  console.log(JSON.stringify(entity))
  const { scene } = entity;
  const skybox = BABYLON.MeshBuilder.CreateBox(
    "skyBox",
    { size: 500.0 },
    entity.scene
  );
  const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
    "textures/TropicalSunnyDay",
    scene
  );
  skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.disableLighting = true;
  skybox.material = skyboxMaterial;
  return entity
};

const addDefaultLight = (entity) => {
  const { scene } = entity;
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
    entity.scene
  );
  light2.position = new BABYLON.Vector3(0, 5, 5);
  light2.intensity = 0.2;
  return entity
};

const addDefaultCamera = (entity) => {
  const { scene, canvas } = entity;
  var camera1 = new BABYLON.ArcRotateCamera(
    "camera1",
    (3 * Math.PI) / 2,
    Math.PI / 4,
    10,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  scene.activeCamera = camera1;
  scene.activeCamera.attachControl(canvas, true);
  // camera1.lowerRadiusLimit = 2;
  // camera1.upperRadiusLimit = 10;
  // camera1.wheelDeltaPercentage = 0.01;

  // // prevent less than
  // camera1.lowerBetaLimit = 0.1;
  // camera1.lowerRadiusLimit = 150;

  // camera1.upperBetaLimit = (Math.PI / 2) * 0.99;
  return entity;
};

const addDefaultGround = (entity) => {
  const { scene } = entity;
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
  return entity
};