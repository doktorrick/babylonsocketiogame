// SocketIOManager.js
function createSocketIOManager(socket, cubeManager, camera1) {
  if (!socket) throw new Error("Socket instance is required.");
  if (!cubeManager) throw new Error("CubeManager instance is required.");
  if (!camera1) throw new Error("Camera is required.");

  const { cubes } = cubeManager;
  let currentPlayerId = null;

  // Socket event handlers
  const initialize = () => {  
    socket.on("connect", () => {
      currentPlayerId = socket.id;
      console.log(`Connected with playerId: ${currentPlayerId}`);
    });

    socket.on("currentPlayers", (players) => {
      for (const id in players) {
        if (!cubes[id]) {
          cubeManager.addCube(id, players[id]);
        }
      }

      if (currentPlayerId && cubes[currentPlayerId]) {
        camera1.target = cubes[currentPlayerId];
      }
    });

    socket.on("newPlayer", (data) => {
      if (!cubes[data.id]) {
        cubeManager.addCube(data.id, data.position);
      }
    });

    socket.on("updateCube", (data) => {
      cubeManager.moveCube(data.id, data.position);
    });

    socket.on("removePlayer", (id) => {
      cubeManager.removeCube(id);
    });
  };

  // Expose methods for interaction if needed
  return {
    initialize,
    getCurrentPlayerId: () => currentPlayerId,
  };
}
