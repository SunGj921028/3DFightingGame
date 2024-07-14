//! Variables of model matrix
var groundModelMatrix = new Matrix4();
var obstacleModelMatrix = new Matrix4();
var playerModelMatrix = new Matrix4();
var enemyModelMatrix = new Matrix4();
var catModelMatrix = new Matrix4();
var swordModelMatrix = new Matrix4();
var heartModelMatrix = new Matrix4();

//? For options making
var ModelMatrixForReflectionObj = new Matrix4();
var ModelMatrixForBumpMapping = new Matrix4();

//? For judging the distance between two objects
function judgeDistance(arg1, arg2) { 
    let distance = Math.sqrt(
        Math.pow((arg1.elements[0]) - (arg2.elements[0]), 2) +
        Math.pow((arg1.elements[1] + 3.0) - (arg2.elements[1]), 2) +
        Math.pow((arg1.elements[2]) - (arg2.elements[2]), 2));
    // console.log("distance = ", distance);
    var judgeDistance = touchJudgeAttack ? attackTouchRange : 1.9;
    if (distance < judgeDistance) { is_touch = 1; }
    else { is_touch = 0; }
}

function judgeWithBody(arg1, arg2) { 
    //! consider Z-axis offset
    let is_with_body = 0;
    if (Math.abs(arg1.elements[0] - arg2.elements[0]) < 1.9) {
        if (Math.abs(arg1.elements[2] - arg2.elements[2]) < 4.8) {
            is_with_body = 1;
        } else { 
            is_with_body = 0;
        }
    }

    if (is_with_body || is_touch) {
        if (arg2 == coordWorld_obstacle1) {
            contact1 = 1;
        } else { 
            contact2 = 1;
        }
    } else { 
        if (arg2 == coordWorld_obstacle1) {
            contact1 = 0;
        } else { 
            contact2 = 0;
        }
    }
}


//? Set the model matrix
function setMat(){
    //? Ground
    groundModelMatrix.setIdentity();
    groundModelMatrix.setTranslate(35.0, 0.0, 0.0); //? +x -> leave me, +y -> up, +z -> to the right
    groundModelMatrix.scale(45.0, 0.05, 15.0);

    //? Player
    playerModelMatrix.setIdentity();
    playerModelMatrix.translate(parseFloat(playerX) - 10.0, parseFloat(jumpOffset) + parseFloat(playerY) - 0.00001, parseFloat(playerZ));
    playerModelMatrix.scale(0.03, 0.03, 0.03);
    playerModelMatrix.rotate(90, 0, 1, 0);
    playerModelMatrix.rotate(-90, 1, 0, 0);
    coordWorld_player = playerModelMatrix.multiplyVector4(coordinatePlayer);

    // console.log("jump ", jumpOffset);

    //? obstacle
    obstacleModelMatrix.setIdentity();
    obstacleModelMatrix.translate(17.0, 3.0, 8.0);
    obstacleModelMatrix.scale(0.5, 3.0, 5.0);
    coordWorld_obstacle1 = obstacleModelMatrix.multiplyVector4(coordinateobstacle1);

    //? Enemy
    enemyModelMatrix.setIdentity();
    enemyModelMatrix.translate(parseFloat(enemyX) + 40.0, parseFloat(enemyY), parseFloat(enemyZ));
    enemyModelMatrix.scale(0.8, 0.8, 0.8);
    enemyModelMatrix.rotate(-90, 0, 1, 0);
    enemyModelMatrix.rotate(parseFloat(enemyRotate), 0, 0, 1);
    coordWorld_enemy = enemyModelMatrix.multiplyVector4(coordinateEnemy);
    // console.log("enemy : ", coordWorld_enemy.elements[0], coordWorld_enemy.elements[1], coordWorld_enemy.elements[2]);

    //? Cat
    catModelMatrix.setIdentity();
    catModelMatrix.translate(26.0, 0.0, -9.0);
    catModelMatrix.scale(0.08, 0.08, 0.08);
    catModelMatrix.rotate(-90, 1, 0, 0);
    catModelMatrix.rotate(-40, 0, 0, 1);

    //? sword
    swordModelMatrix.setIdentity();
    swordModelMatrix.translate(parseFloat(playerX) - 9.2, parseFloat(playerY) + 3.0, parseFloat(playerZ) + 1.0);
    swordModelMatrix.scale(0.03, 0.03, 0.03);
    swordModelMatrix.rotate(90, 1, 0, 0);
    swordModelMatrix.rotate(-30, 0, 1, 0);
    swordModelMatrix.rotate(angleX / 2.0, 1, 0, 0);
    swordModelMatrix.rotate(-angleY / 2.0, 0, 1, 0);
    swordModelMatrix.translate(parseFloat(swordoffsetX), 0.0, parseFloat(swordoffsetZ)); //! For attack moving
    coordWorld_sword = swordModelMatrix.multiplyVector4(coordinateSword);
    // console.log("Sword : ", coordWorld_sword.elements[0], coordWorld_sword.elements[1], coordWorld_sword.elements[2]);

    //? heart
    heartModelMatrix.setIdentity();
    heartModelMatrix.translate(parseFloat(enemyX) + 40.0, parseFloat(enemyY) + 8.7, parseFloat(enemyZ) - leftHeartOffset);
    heartModelMatrix.scale(0.3, 0.3, enemyHeart * 0.2);


    //? For reflection object
    ModelMatrixForReflectionObj.setIdentity();
    ModelMatrixForReflectionObj.translate(positionX, positionY, positionZ);
    ModelMatrixForReflectionObj.scale(4.0, 4.0, 4.0);

    //? For bump mapping
    ModelMatrixForBumpMapping.setIdentity();
    ModelMatrixForBumpMapping.translate(10.0, 5.0, -7.0);
    ModelMatrixForBumpMapping.scale(0.5, 3.0, 5.0);
    coordWorld_obstacle2 = ModelMatrixForBumpMapping.multiplyVector4(coordinateobstacle2);
}
