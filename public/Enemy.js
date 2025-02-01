class Enemy {
    constructor(scene, modelPath, startPosition, scale = 0.5, patrolRadius = 5) {
        this.scene = scene;
        this.modelPath = modelPath;
        this.patrolRadius = patrolRadius;
        this.position = startPosition;

        this.animations = {};
        this.isMoving = false;
        this.currentTarget = null;
        this.movementSpeed = 0.02;
        this.waitDuration = 2000; // 2 seconds
        this.waypoints = [];
        this.scale = scale;
        this.startPosition = startPosition;
        this.loadModel(this.startPosition);
        this.track = [
            { turn: 86, dist: 7 },
            { turn: -85, dist: 14.8 },
            { turn: -93, dist: 16.5 },
            { turn: 48, dist: 25.5 },
            { turn: -112, dist: 30.5 },
            { turn: -72, dist: 33.2 },
            { turn: 42, dist: 37.5 },
            { turn: -98, dist: 45.2 },
            { turn: 0, dist: 47 }
        ];
        this.currentWaypointIndex = 0;
        this.distance = 0;
        this.step = 0.2;
        this.loadModel(this.modelPath);

    }

    async loadModel(modelPath) {
        const result = await BABYLON.SceneLoader.ImportMeshAsync("", modelPath, "", this.scene);
        this.enemyMesh = result.meshes[0];
        this.enemyMesh.scaling = new BABYLON.Vector3(this.scale, this.scale, this.scale);
        this.enemyMesh.position = this.position.clone();
        // this.enemyMesh.rotate(BABYLON.Vector3.Up(), -0.1);
        this.enemyMesh.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(-95), BABYLON.Space.LOCAL);
        this.startRotation = this.enemyMesh.rotationQuaternion.clone();

        // this.scene.beginAnimation(result.skeletons[0], 0, 100, true, 1.0);

        this.scene.onBeforeRenderObservable.add(() => {
            this.moveEnemy();
        });
    }

    // loadModel(startPosition) {
    //     BABYLON.SceneLoader.ImportMesh("", this.modelPath, "", this.scene, (newMeshes) => {
    //         this.enemyMesh = newMeshes[0];
    //         this.enemyMesh.scaling.scaleInPlace(this.scale);
    //         this.enemyMesh.position = startPosition.clone();

    //         // // Initialize waypoints around starting position
    //         // this.generateWaypoints(startPosition);

    //         // // Start patrolling
    //         // this.startPatrol();
    //     });
    // }

    moveEnemy() {
        if (!this.enemyMesh) return;

        // this.enemyMesh.movePOV(0, 0, this.step);

        // const forward = this.enemyMesh.forward.scale(this.step);
        // this.enemyMesh.position.addInPlace(forward);
        // this.distance += this.step;
        // const forward = this.enemyMesh.forward;  // Returns a Vector3
        // const angle = Math.atan2(forward.x, forward.z); // Get the rotation in radians
        // console.log("Enemy Facing Angle (Radians):", angle);
        // console.log("Enemy Facing Angle (Degrees):", BABYLON.Tools.ToDegrees(angle));

        // if (this.distance > this.track[this.currentWaypointIndex].dist) {
        //     this.enemyMesh.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(this.track[this.currentWaypointIndex].turn), BABYLON.Space.LOCAL);
        //     this.currentWaypointIndex++;
        //     this.currentWaypointIndex %= this.track.length;
            
        //     if (this.currentWaypointIndex === 0) {
        //         this.distance = 0;
        //         this.enemyMesh.position = this.position.clone();
        //         this.enemyMesh.rotationQuaternion = this.startRotation.clone();
        //     }
        // }
    }
    
    // moveEnemy() {
    //     if (!this.enemyMesh) return;
    
    //     const targetPos = this.track[this.currentWaypointIndex].position;
    //     const currentPos = this.enemyMesh.position;
    
    //     // Calculate direction vector
    //     const direction = targetPos.subtract(currentPos).normalize();
    
    //     // Rotate to face movement direction
    //     const angle = Math.atan2(direction.x, direction.z);
    //     this.enemyMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, angle);
    
    //     // Move forward
    //     this.enemyMesh.movePOV(0, 0, this.step);
    //     this.distance += this.step;
    
    //     // Check if reached the waypoint
    //     if (this.distance > this.track[this.currentWaypointIndex].dist) {
    //         this.currentWaypointIndex++;
    //         this.currentWaypointIndex %= this.track.length;
    
    //         if (this.currentWaypointIndex === 0) {
    //             this.distance = 0;
    //             this.enemyMesh.position = this.position.clone();
    //             this.enemyMesh.rotationQuaternion = this.startRotation.clone();
    //         }
    //     }
    // }
    
}