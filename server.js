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
    console.log(`Player connected: ${socket.id}`);

    // Initialize the player's cube position
    players[socket.id] = { x: 0, y: 0, z: 0 };

    // Send the current state of all players to the new player
    socket.emit('currentPlayers', players);

    // Notify all other players about the new player
    socket.broadcast.emit('newPlayer', { id: socket.id, position: players[socket.id] });

    // Handle movement from the player
    socket.on('moveCube', (position) => {
        // Update the player's position
        players[socket.id] = position;

        // Broadcast the updated position to all other players
        socket.broadcast.emit('updateCube', { id: socket.id, position });
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
