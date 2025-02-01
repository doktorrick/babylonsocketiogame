const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Players object to store each player's cube position
let players = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log(`Server: Player connected: ${socket.id}`);

    // Initialize the player's cube position
    players[socket.id] = { x: 0, y: 0, z: 0, rotation: 0 };

    // When a player joins, send them existing players
    socket.emit('currentPlayers', players);

    // Broadcast new player to others
    socket.broadcast.emit('newPlayer', { id: socket.id, position: players[socket.id] });

    // Handle player movement
    socket.on("playerMove", (data) => {
        if (players[socket.id]) {
            players[socket.id] = {
                position: { x: data.position.x, y: data.position.y, z: data.position.z },
                rotation: data.rotation,  // Store rotation properly
                animationTime: data.animationTime
            };
            
            console.log(`Update player: ${socket.id} rotation: ${data.rotation}`);
    
            socket.broadcast.emit("updatePlayer", { 
                id: socket.id, 
                position: players[socket.id].position, 
                rotation: players[socket.id].rotation, 
                animationTime: players[socket.id].animationTime
            });
        }
    });
    
    

    // Handle player disconnect
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);

        // Remove the player from the players object
        delete players[socket.id];

        // Notify all other players to remove this cube
        io.emit('removePlayer', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
