function CharacterControlManager(scene, camera1) {
    // Keyboard events
    var inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));

    // Load hero character
    BABYLON.SceneLoader.ImportMesh("", "./models/", "HVGirl.glb", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
        var hero = newMeshes[0];

        //Scale the model down        
        hero.scaling.scaleInPlace(0.1);
        //Lock camera on the character 
        camera1.target = hero;

        //Hero character variables 
        var heroSpeed = 0.03;
        var heroSpeedBackwards = 0.01;
        var heroRotationSpeed = 0.1;

        var animating = true;

        const walkAnim = scene.getAnimationGroupByName("Walking");
        const walkBackAnim = scene.getAnimationGroupByName("WalkingBack");
        const idleAnim = scene.getAnimationGroupByName("Idle");
        const sambaAnim = scene.getAnimationGroupByName("Samba");

        //Rendering loop (executed for everyframe)
        scene.onBeforeRenderObservable.add(() => {
            var keydown = false;
            //Manage the movements of the character (e.g. position, direction)
            if (inputMap["w"]) {
                hero.moveWithCollisions(hero.forward.scaleInPlace(heroSpeed));
                keydown = true;
            }
            if (inputMap["s"]) {
                hero.moveWithCollisions(hero.forward.scaleInPlace(-heroSpeedBackwards));
                keydown = true;
            }
            if (inputMap["a"]) {
                hero.rotate(BABYLON.Vector3.Up(), -heroRotationSpeed);
                keydown = true;
            }
            if (inputMap["d"]) {
                hero.rotate(BABYLON.Vector3.Up(), heroRotationSpeed);
                keydown = true;
            }
            if (inputMap["b"]) {
                keydown = true;
            }

            //Manage animations to be played  
            if (keydown) {
                if (!animating) {
                    animating = true;
                    if (inputMap["s"]) {
                        //Walk backwards
                        walkBackAnim.start(true, 1.0, walkBackAnim.from, walkBackAnim.to, false);
                    }
                    else if
                        (inputMap["b"]) {
                        //Samba!
                        sambaAnim.start(true, 1.0, sambaAnim.from, sambaAnim.to, false);
                    }
                    else {
                        //Walk
                        walkAnim.start(true, 1.0, walkAnim.from, walkAnim.to, false);
                    }
                }
            }
            else {
                if (animating) {
                    //Default animation is idle when no key is down     
                    idleAnim.start(true, 1.0, idleAnim.from, idleAnim.to, false);

                    //Stop all animations besides Idle Anim when no key is down
                    sambaAnim.stop();
                    walkAnim.stop();
                    walkBackAnim.stop();

                    //Ensure animation are played only once per rendering loop
                    animating = false;
                }
            }
        });
    });
            
}