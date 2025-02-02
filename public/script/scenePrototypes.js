const SkyboxPrototype = {
    add(scene) {
      const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 3500.0 }, scene);
      const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
      skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("../textures/TropicalSunnyDay", scene);
      skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
      skyboxMaterial.backFaceCulling = false;
      skyboxMaterial.disableLighting = true;
      skybox.material = skyboxMaterial;
      return scene;
    }
};
  
const GroundPrototype = {
    add(scene) {
        const ground = BABYLON.MeshBuilder.CreateBox("ground", { width:20, height: 0.2, depth: 10 }, scene);

        // const ground = BABYLON.MeshBuilder.CreateGround("ground", { width:20, height: 20, depth: 6 }, scene);
        // var ground = BABYLON.MeshBuilder.CreateBox("ground", {width: 6, height: 0.5, depth: 6}, scene);

        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("../textures/wood.jpg", scene);
        groundMaterial.diffuseTexture.uScale = 30;
        groundMaterial.diffuseTexture.vScale = 30;
        ground.material = groundMaterial;
        ground.checkCollisions = true;

        return scene;
    }
};

const CameraPrototype = {
    add(scene, canvas) {
        const camera = new BABYLON.ArcRotateCamera("camera1", (3 * Math.PI) / 2, Math.PI / 4, 50, new BABYLON.Vector3(0, 0, 0), scene);
        scene.activeCamera = camera;
        scene.activeCamera.attachControl(canvas, true);
        return scene;
    }
};

const LightPrototype = {
    add(scene) {
        const light1 = new BABYLON.HemisphericLight(
            "light1",
            new BABYLON.Vector3(0, 1, 0),
            scene
        );
        light1.intensity = 0.6;
        light1.specular = BABYLON.Color3.Black();
    
        const light2 = new BABYLON.DirectionalLight(
            "dir01",
            new BABYLON.Vector3(0.5, -0.5, -1.0),
            scene
        );
        light2.position = new BABYLON.Vector3(0, 5, 5);
        light2.intensity = 0.2;
        return scene;
    }

}
  
function clonePrototype(proto) {
    function F() {}
    F.prototype = proto;
    return new F();
}

const skybox = clonePrototype(SkyboxPrototype);
const ground = clonePrototype(GroundPrototype);
// const camera = clonePrototype(CameraPrototype);
const light = clonePrototype(LightPrototype);