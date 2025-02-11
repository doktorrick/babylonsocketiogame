function createSkybox(scene) {
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 3500.0 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);

    const reflectionTexture = new BABYLON.CubeTexture("../textures/TropicalSunnyDay", scene);
    skyboxMaterial.reflectionTexture = reflectionTexture;
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;

    skybox.material = skyboxMaterial;
    return scene;
}

function createGround(scene) {
    const ground = BABYLON.MeshBuilder.CreateBox("ground", { width: 20, height: 0.2, depth: 10 }, scene);

    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    const groundTexture = new BABYLON.Texture("../textures/wood.jpg", scene);
    groundMaterial.diffuseTexture = groundTexture;
    groundMaterial.diffuseTexture.uScale = 30;
    groundMaterial.diffuseTexture.vScale = 30;

    ground.material = groundMaterial;
    ground.checkCollisions = true;
    return scene;
}

function createCamera(scene, canvas) {
    const camera = new BABYLON.ArcRotateCamera("camera1", (3 * Math.PI) / 2, Math.PI / 4, 50, new BABYLON.Vector3(0, 0, 0), scene);
    scene.activeCamera = camera;
    camera.attachControl(canvas, true);
    return scene;
}

function createCameraWithoutCanvas(scene) {
    const canvas = document.getElementById("renderCanvas");
    const camera = new BABYLON.ArcRotateCamera("camera1", (3 * Math.PI) / 2, Math.PI / 4, 50, new BABYLON.Vector3(0, 0, 0), scene);
    scene.activeCamera = camera;
    camera.attachControl(canvas, true);

    scene.getEngine().getRenderingCanvas().addEventListener("pointerdown", () => {
        camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
    });

    return scene;
}

function createLights(scene) {
    const light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light1.intensity = 0.6;
    light1.specular = BABYLON.Color3.Black();

    const light2 = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0.5, -0.5, -1.0), scene);
    light2.position = new BABYLON.Vector3(0, 5, 5);
    light2.intensity = 0.2;

    return scene;
}

function createScene(engine, canvas) {
    const scene = new BABYLON.Scene(engine);
    const skybox = createSkybox(scene);
    const ground = createGround(scene);
    const lights = createLights(scene);

    return {
        scene,
        skybox,
        ground,
        lights
    };
}