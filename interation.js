var lockMode = 0;

screenMode.push(() => {
    canvas.requestPointerLock =
        canvas.requestPointerLock || canvas.mozRequestPointerLock;
    document.exitPointerLock =
        document.exitPointerLock || document.mozExitPointerLock;
    canvas.onclick = function () {
        canvas.requestPointerLock();
    };
    document.addEventListener("pointerlockchange", lockChangeAlert, false);
    document.addEventListener("mozpointerlockchange", lockChangeAlert, false);
});

function lockChangeAlert() {
    if (document.pointerLockElement === canvas ||
        document.mozPointerLockElement === canvas) {
        lockMode = 0;
        interface();
        // console.log("The pointer lock status is now locked");
        document.getElementById("pause").style.display = "none";
        document.addEventListener("mousemove", updatePosition, false);
    } else {
        lockMode = 1;
        // console.log("The pointer lock status is now unlocked");
        document.getElementById("pause").style.display = "block";
        document.removeEventListener("mousemove", updatePosition, false);
    }
}

var animation;
var rotatePlayer = 0;
function updatePosition(evt) { 
    //! Change sensitivity
    if (sensitivityMode == 0) { sensitivity = 4.0; }
    else { sensitivity = 1.0; }
    angleX += evt.movementX / sensitivity;
    angleY += evt.movementY / sensitivity;
    if (!thirdPersonView) { //? First person view
        if (angleX < -120) angleX = -120;
        if (angleX > 120) angleX = 120;
        if (angleY < -35) angleY = -35;
        if (angleY > 45) angleY = 45;
    } else { //? Third person view
        if (angleX < -55) angleX = -55;
        if (angleX > 55) angleX = 55;
        if (angleY < -30) angleY = -30;
        if (angleY > 15) angleY = 15;
    }

    if (!animation) {
        animation = requestAnimationFrame(function () {
            animation = null;
        });
    }
}

var stop = 0;
var stop_clock;
var stopTimer = 5;
function mousedown(evt) { 
    switch (evt.button) { 
        case 0:
            // console.log("Left mouse button clicked, Attack!!");
            //TODO: Attack
            attackMode = 1;
            swordMoveClock = setInterval(() => { //? Attack for 5 seconds
                swordMoveCount--;
            }, 125);
            touchJudgeAttack = 1;
            judgeDistance(coordWorld_sword, coordWorld_enemy);
            if (is_touch) {
                damage = Math.floor(Math.random() * 2) + 1;
                enemyHeart -= damage;
                leftHeartOffset += (damage / 5.0);
            }
            if (enemyHeart <= 0) { gameOver = 1;}
            touchJudgeAttack = 0;
            break;
        case 1:
            // console.log("Middle mouse button clicked, change sensitivity!!");
            sensitivityMode ^= 1;
            break;
        case 2:
            // console.log("Right mouse button clicked, defence!!");
            //TODO: Defence
            isMagic = 1;
            if (stop == 0) {
                if (isMagic == 1) {
                    if (isMagic) {
                        enemyStep = 0.01;
                        enemyRotatevaluePerTime = 0.2;
                        document.getElementById("magic-message").style.display = "block";
                    }
                    stop = 1;
                    // console.log("Magic");
                    clock = setInterval(() => { //? continue for 5 seconds
                        timer--;
                        document.getElementById("magic-message").style.display = "none";
                        // console.log("timer : ", timer);
                    }, 1000);
                } else { 
                    enemyStep = 0.05;
                    enemyRotatevaluePerTime = 1;
                }
            }
            break;
    }
}

function keydown(evt) {
    judgeDistance(coordWorld_player, coordWorld_obstacle1);
    judgeWithBody(coordWorld_player, coordWorld_obstacle1);
    judgeDistance(coordWorld_player, coordWorld_obstacle2);
    judgeWithBody(coordWorld_player, coordWorld_obstacle2);
    let rotateMatrix = new Matrix4();
    rotateMatrix.setRotate(angleY, 0, 0, -1); //for mouse rotation
    rotateMatrix.rotate(angleX, 0, -1, 0); //for mouse rotation
    let orthrotateMatrix = new Matrix4();
    orthrotateMatrix.setRotate(angleY, 0, 0, -1); //for mouse rotation
    orthrotateMatrix.rotate(angleX - 90, 0, -1, 0); //for mouse rotation

    var viewDir = new Vector3([cameraDirX, cameraDirY, cameraDirZ]);
    var newViewDir = rotateMatrix.multiplyVector3(viewDir);
    var orthnewViewDir = orthrotateMatrix.multiplyVector3(viewDir);

    if (evt.key != "i" && evt.key != "I") { 
        document.getElementById("introduction").style.display = "none";
    }
    if (lockMode == 0) { 
        var offsetX = 0;
        var offsetY = 0;
        if (evt.key == "w" || evt.key == "W") {
            offsetX = newViewDir.elements[0] * playerStep;
            offsetY = newViewDir.elements[2] * playerStep;
        } else if (evt.key == "s" || evt.key == "S") {
            offsetX = newViewDir.elements[0] * -1 * playerStep;
            offsetY = newViewDir.elements[2] * -1 * playerStep;
        } else if (evt.key == "a" || evt.key == "A") {
            offsetX = orthnewViewDir.elements[0] * playerStep;
            offsetY = orthnewViewDir.elements[2] * playerStep;
        } else if (evt.key == "d" || evt.key == "D") { 
            offsetX = orthnewViewDir.elements[0] * -1 * playerStep;
            offsetY = orthnewViewDir.elements[2] * -1 * playerStep;
        }

        //! Add to real position
        playerX += offsetX;
        playerZ += offsetY;

        //! Judge if the player is out of the boundary
        //! Add to camera position
        
        if (playerX < 0 || playerX > 90 || contact1 || contact2) {
            playerX -= offsetX;
        } else { 
            //? Third person view
            cameraX += offsetX;
            //? First person view
            cameraXThird += offsetX;
        }
        if (playerZ < -15 || playerZ > 15) {
            playerZ -= offsetY;
        } else { 
            cameraZ += offsetY;
            cameraZThird += offsetY;
        }

        if (evt.key == " ") { 
            // Code to handle space button press
            // console.log("Jump!!");
            jumpUp = 1;
            cameraY += 2.0;
            jumpClock = setInterval(() => {
                jumpTimer--;
            }, 125);
        }
    }
}

const action = {};
function interface() { 
    // console.log("interface");
    document.onkeydown = function (ev) {
        if (action[ev.key]) {
            return;
        }
        if (ev.key == "t" || ev.key == "T") {
            // console.log("Change view");
            thirdPersonView ^= 1; //? If third_view is 1, then it will be 0, and vice versa, to checnge the player's view
            // console.log(thirdPersonView);
        }
        if (ev.key == "i" || ev.key == "I") { 
            // console.log("Instruction");
            document.getElementById("introduction").style.display = "block";
        }

        action[ev.key] = setInterval(() => {
            keydown(ev);
        }, (1000 / 45));
    };
    document.onkeyup = function (ev) {
        if (!action[ev.key]) {
            return;
        }

        clearInterval(action[ev.key]);
        action[ev.key] = undefined;
    };

    document.onmousedown = function (ev) {
        mousedown(ev);
    };
}

