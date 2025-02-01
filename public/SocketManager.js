class SocketManager {

    constructor(environment) {
        if (!environment) {
            throw new Error("Environment instance is required for SocketManager.");
        }
        this.environment = environment;
        this.socket = null;  
        // this.enviroment = enviroment; 
        this.setupIO();
        this.initSocketListeners();
    }

    setupIO() {
        if(this.socket === null) {
            console.log("starting IO...Object SocketManager");
            this.socket = io();
            console.log(`socket id: ${this.socket.id}`)
        }
    }

    // Initialize socket event listeners
    //รับ
    initSocketListeners() {
        this.socket.on("connect", () => {
            console.log("Connected to Socket.IO Server");
            console.log("Socket ID:", this.socket.id); 
        });

        this.socket.on("currentPlayers", (playersData) => {
            console.log(`Current Players.......`)
            for (let id in playersData) {
                if (id !== this.socket.id) {
                    console.log(`Current Players.......${this.socket.id}`)
                    this.environment.addOtherPlayer(id, playersData[id]);
                }
            }
        });

        this.socket.on("newPlayer", (playerData) => {
            if (playerData.id !== this.socket.id) {
                this.environment.otherPlayers[playerData.id] = playerData[playerData.id];
                this.environment.addPlayerJoin(playerData.id, playerData);
            }
        });

        this.socket.on("moveCharacter", (playerData) => {
            if (playerData.id !== this.socket.id) {
                const targetPlayer = this.environment.otherPlayers[playerData.id];
                if (targetPlayer) {
                    targetPlayer.hero.position.copyFrom(playerData.position);
                    targetPlayer.hero.rotation.copyFrom(playerData.rotation);
                }
            }
        });

        this.socket.on("updatePlayer", (playerData) => {
            if (playerData.id !== this.socket.id) {
                const targetPlayer = this.environment.otherPlayers[playerData.id];
                if (targetPlayer) {
                    targetPlayer.hero.position.copyFrom(playerData.position);
                    targetPlayer.hero.rotation.copyFrom(playerData.rotation);
                }
            }
        });
        

        this.socket.on("removePlayer", (playerId) => {
            this.environment.removePlayer(playerId);
        });
    }

    // Emit player movement & animation state to the server
    emitPlayerMove(position, rotation, animationTime) {
        this.socket.emit("playerMove", {
            position: position,
            rotation: rotation,
            animationTime: animationTime,
        });
    }
    

    emitUpdatePlayerPositionAndAnimation(position, rotation, animationTime) {
        this.socket.emit("updatePlayer", {
            position: position,
            rotation: rotation,
            animationTime: animationTime,
        });
    }
}
