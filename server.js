const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Store player states
let players = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log(`✅ Player connected: ${socket.id}`);

    // Initialize player state
      // Broadcast the new player to all other players
    socket.on("playerJoin", (data) => {
        const { id, position, rotation } = data;
        players[id] = { position, rotation };

        // Broadcast the new player to all other clients
        socket.broadcast.emit("newPlayer", { id, position });
    });

    // Send current players to the new player
    socket.emit('currentPlayers', players);

    // Notify others about the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // Handle player animations
    socket.on("playerAnimation", (data) => {
        if (!players[socket.id]) return;
    
        // Debug: Log when the server receives animation updates
        // console.log(`🎥 Animation received from ${socket.id} - Frame: ${data.frame}`);
    
        // Broadcast animation update to all clients, including the sender
        socket.broadcast.emit("playerAnimation", {
            playerId: socket.id,
            frame: data.frame,
            rotationX: data.rotationX, 
            timestamp: Date.now()
        });
    });

    // Handle player movement
    socket.on("playerMove", (data) => {
        if (!players[socket.id]) return;

        players[socket.id].position = { ...data.position };
        players[socket.id].rotation = data.rotation;

        // Broadcast movement update
        socket.broadcast.emit("updatePlayer", {
            id: socket.id,
            position: players[socket.id].position,
            rotation: players[socket.id].rotation
        });
    });

    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log(`❌ Player disconnected: ${socket.id}`);

        // Remove player from the list
        delete players[socket.id];

        // Notify all other players
        io.emit('removePlayer', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
