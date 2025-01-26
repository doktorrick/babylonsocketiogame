function CubeManager(scene) {
    const cubes = {}; 
    
    const addCube = (id, position) => {
      if (cubes[id]) {
        console.warn(`Cube with ID "${id}" already exists.`);
        return;
      }
      
      const cube = BABYLON.MeshBuilder.CreateBox(id, { size: 1 }, scene);
      const material = new BABYLON.StandardMaterial(`${id}-material`, scene);
      cube.position = new BABYLON.Vector3(position.x, position.y + 0.5, position.z);
      cube.material = material;
      cubes[id] = cube;
    };
  
    const moveCube = (id, position) => {
      if (!cubes[id]) {
        console.warn(`Cube with ID "${id}" does not exist.`);
        return;
      }
      cubes[id].position = new BABYLON.Vector3(position.x, position.y + 0.5, position.z);
    };
    
    const removeCube = (id) => {
      if (!cubes[id]) {
        console.warn(`Cube with ID "${id}" does not exist.`);
        return;
      }
      cubes[id].dispose();
      delete cubes[id];
    };
  
    return {
      addCube,
      moveCube,
      removeCube,
      cubes
    };
}