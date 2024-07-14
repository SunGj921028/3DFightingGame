function compileShader(gl, vShaderText, fShaderText){
    //////Build vertex and fragment shader objects
    var vertexShader = gl.createShader(gl.VERTEX_SHADER)
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    //The way to  set up shader text source
    gl.shaderSource(vertexShader, vShaderText)
    gl.shaderSource(fragmentShader, fShaderText)
    //compile vertex shader
    gl.compileShader(vertexShader)
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.log('vertex shader ereror');
        var message = gl.getShaderInfoLog(vertexShader); 
        console.log(message);//print shader compiling error message
    }
    //compile fragment shader
    gl.compileShader(fragmentShader)
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.log('fragment shader ereror');
        var message = gl.getShaderInfoLog(fragmentShader);
        console.log(message);//print shader compiling error message
    }

    /////link shader to program (by a self-define function)
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    //if not success, log the program info, and delete it.
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        alert(gl.getProgramInfoLog(program) + "");
        gl.deleteProgram(program);
    }

    return program;
}

function initAttributeVariable(gl, a_attribute, buffer){
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}
  
function initArrayBufferForLaterUse(gl, data, num, type) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return null;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    // Store the necessary information to assign the object to the attribute variable later
    buffer.num = num;
    buffer.type = type;

    return buffer;
}

function initVertexBufferForLaterUse(gl, vertices, normals, texCoords, tagents, bitagents, crossTexCoords) {
    var nVertices = vertices.length / 3;

    var o = new Object();
    o.vertexBuffer = initArrayBufferForLaterUse(gl, new Float32Array(vertices), 3, gl.FLOAT);
    if (normals != null) o.normalBuffer = initArrayBufferForLaterUse(gl, new Float32Array(normals), 3, gl.FLOAT);
    if (texCoords != null) o.texCoordBuffer = initArrayBufferForLaterUse(gl, new Float32Array(texCoords), 2, gl.FLOAT);
    if (tagents != null) o.tagentsBuffer = initArrayBufferForLaterUse(gl, new Float32Array(tagents), 3, gl.FLOAT);
    if (bitagents != null) o.bitagentsBuffer = initArrayBufferForLaterUse(gl, new Float32Array(bitagents), 3, gl.FLOAT);
    if (crossTexCoords != null)
        o.crossTexCoordsBuffer = initArrayBufferForLaterUse(gl, new Float32Array(crossTexCoords), 1, gl.FLOAT);
    //you can have error check here
    o.numVertices = nVertices;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return o;
}

var mouseLastX, mouseLastY;
var mouseDragging = false;
var angleX = 0, angleY = 0;
var gl, canvas;

var cameraX = -10, cameraY = 5, cameraZ = 0; //! First person view
var cameraXThird = -17.0, cameraYThird = 8.0, cameraZThird = 0; //! Third person view
var cameraDirX = 1, cameraDirY = 0, cameraDirZ = 0;
var lightX = -5, lightY = 15, lightZ = 10;
var positionX = 28, positionY = 7, positionZ = -10; //? For mirror object

//! For view first person or third person
var thirdPersonView = 0; // 0 -> first person, 1 -> third person

var cubeMapTex;
var quadObj;
var rotateAngle = 0;

//! Player's position
var playerX = 0.0, playerY = 0.0, playerZ = 0.0;

//! For player moving
var playerStep = 0.25;

//! For enemy moving
var enemyStep = 0.05;
var enemyX = 0.0, enemyY = 0.0, enemyZ = 0.0;
var enemyRotate = -10; //? Range from -10 to 10
var enemyRotatevaluePerTime = 1;
var rotateOffset;
var dirEnemy = 0; //? Range from 0 to 3

//! For mouse sensitivity
var sensitivityMode = 0; //* Press mouse middle button to change it, 0 -> for low sensitivity, 1 -> for high sensitivity
var sensitivity = 4.0;

//! For coordinate
var coordinatePlayer = new Vector4([0.0, 5.0, 0.0, 1.0]);
var coordWorld_player;
var coordinateobstacle1 = new Vector4([0.0, 0.0, 0.0, 1.0]);
var coordWorld_obstacle1;
var coordinateEnemy = new Vector4([0.0, 4.3, 0.0, 1.0]);
var coordWorld_enemy;
var coordinateSword = new Vector4([0.0, 0.0, 0.0, 1.0]);
var coordWorld_sword;
var coordinateobstacle2 = new Vector4([0.0, 0.0, 0.0, 1.0]);
var coordWorld_obstacle2;

var is_touch = 0;
var contact1 = 0;
var contact2 = 0;

//! skills or not

//* Players heart
var mainPlayerHeart = 10;
var enemyHeart = 10;

//! Frame Buffer Object
var dynamicReflectionFBO;
var shadowFBO;

var offScreenWidth = 2048, offScreenHeight = 2048; //for cubemap render

var timer = 5;
var clock;
var isMagic = 0;

//! Attack
var attackMode = 0;
var swordoffsetX = 0.0;
var swordoffsetZ = 0.0;
var swordMoveCount = 2;
var swordMoveClock;
var touchJudgeAttack = 0;
var attackTouchRange = 5.0;
var damage;
var leftHeartOffset = 0.0;

//! Game over
var gameOver = 0;

//! Bump mapping normal map mode
var normalmode = 0;

//! Jump
var jumpUp = 0;
var jumpDown = 0;
var jumpClock;
var jumpTimer = 2;
var jumpOffset = 0.0;

//TODO For screen locking and initialization
const screenMode = [];
screenMode.push(main);
screenMode.push(load_all_texture);

window.onload = async () => {
    for (const func of screenMode) {
        await func();
    }
};

async function main() { 
    canvas = document.getElementById("webgl");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        console.log("Failed to get the rendering context for WebGL");
        return;
    }

    setInterval(() => {
        refresh;
    }, 1);

    //? init shaders program
    initDynamicReflectionShaderProgram();
    initCubeMapShaderProgram();
    initOnScreenShaderProgram();
    initShadowShaderProgram();

    //? init framebuffer for shadow and dynamic reflection
    shadowFBO = initFrameBufferForShadowRendering();
    dynamicReflectionFBO = initFrameBufferForCubemapRendering();

    //? Load model and texture
    getAllModelData();
    load_all_texture();

    //? Draw everything
    draw(); //* draw it once before mouse move
    // interface();


    var changeDir = setInterval(() => {
        dirEnemy = Math.floor(Math.random() * 4);
    }, 1000);

    var changeRotate = setInterval(() => { 
        rotateOffset = Math.floor(Math.random() * 2);
    }, 350);

    document.getElementById("gameover-message").style.display = "none";

    var refresh = function () { 
        if (!gameOver) {
            if (lockMode == 0) {
                // console.log(isMagic);
                if (dirEnemy == 0) { //! Up
                    if (enemyX + enemyStep <= 90.0) { enemyX += enemyStep; }
                } else if (dirEnemy == 1) { //! Down
                    if (enemyX - enemyStep >= 0.0) { enemyX -= enemyStep; }
                } else if (dirEnemy == 2) { //! Left
                    if (enemyZ - enemyStep >= -15.0) { enemyZ -= enemyStep; }
                } else if (dirEnemy == 3) { //! Right
                    if (enemyZ + enemyStep <= 15.0) { enemyZ += enemyStep; }
                }
                if (rotateOffset == 0) { //! left Side
                    if (enemyRotate + enemyRotatevaluePerTime <= 10) { enemyRotate += enemyRotatevaluePerTime; }
                    // console.log(enemyRotate);
                } else {
                    if (enemyRotate - enemyRotatevaluePerTime >= -10) { enemyRotate -= enemyRotatevaluePerTime; }
                }
                if (attackMode) {
                    if (swordoffsetX + 8.0 <= 24.0) { swordoffsetX += 8.0; }
                    if (swordoffsetZ - 8.0 >= -24.0) { swordoffsetZ -= 8.0; }
                }
                if (jumpUp) {
                    if (jumpOffset + 1.0 <= 2.0) { jumpOffset += 1.0; }
                    // cameraY += jumpOffset;
                } else { 
                    // console.log("jump", jumpOffset);
                    if (jumpOffset - 1.0 >= 0.0) { jumpOffset -= 1.0; }
                    // cameraY -= parseFloat(jumpOffset);
                    // console.log("cameraY", cameraY);
                }
            }
        } else { 
            document.getElementById("gameover-message").style.display = "block";
            document.getElementById("pause").style.display = "none";
            document.removeEventListener("mousemove", updatePosition, false);
        }
        if (jumpTimer <= 0) { 
            clearInterval(jumpClock);
            jumpUp = 0;
            jumpTimer = 2;
            cameraY = 5.0;
        }
        if (timer <= 0) { 
            clearInterval(clock);
            document.getElementById("magic-message").style.display = "none";
            timer = 5;
            isMagic = 0;
            enemyStep = 0.05;
            enemyRotatevaluePerTime = 1;
            stop_clock = setInterval(() => { //? Cold for 5 seconds
                stopTimer--;
            }, 1000);
        }
        if (stopTimer <= 0) { 
            clearInterval(stop_clock);
            stopTimer = 5;
            stop = 0;
        }
        if (swordMoveCount <= 0) { 
            clearInterval(swordMoveClock);
            swordMoveCount = 2;
            attackMode = 0;
            swordoffsetX = 0.0;
            swordoffsetZ = 0.0;
        }
        draw();
        requestAnimationFrame(refresh);
    }
    refresh();
}

function calculateTangentSpace(position, texcoord){
    //iterate through all triangles
    let tagents = [];
    let bitagents = [];
    let crossTexCoords = [];
    for( let i = 0; i < position.length/9; i++ ){
        let v00 = position[i*9 + 0];
        let v01 = position[i*9 + 1];
        let v02 = position[i*9 + 2];
        let v10 = position[i*9 + 3];
        let v11 = position[i*9 + 4];
        let v12 = position[i*9 + 5];
        let v20 = position[i*9 + 6];
        let v21 = position[i*9 + 7];
        let v22 = position[i*9 + 8];
        let uv00 = texcoord[i*6 + 0];
        let uv01 = texcoord[i*6 + 1];
        let uv10 = texcoord[i*6 + 2];
        let uv11 = texcoord[i*6 + 3];
        let uv20 = texcoord[i*6 + 4];
        let uv21 = texcoord[i*6 + 5];
    
        let deltaPos10 = v10 - v00;
        let deltaPos11 = v11 - v01;
        let deltaPos12 = v12 - v02;
        let deltaPos20 = v20 - v00;
        let deltaPos21 = v21 - v01;
        let deltaPos22 = v22 - v02;
    
        let deltaUV10 = uv10 - uv00;
        let deltaUV11 = uv11 - uv01;
        let deltaUV20 = uv20 - uv00;
        let deltaUV21 = uv21 - uv01;
    
        let r = 1.0 / (deltaUV10 * deltaUV21 - deltaUV11 * deltaUV20);
        for( let j=0; j< 3; j++ ){
            crossTexCoords.push( (deltaUV10 * deltaUV21 - deltaUV11 * deltaUV20) );
        }
        let tangentX = (deltaPos10 * deltaUV21 - deltaPos20 * deltaUV11)*r;
        let tangentY = (deltaPos11 * deltaUV21 - deltaPos21 * deltaUV11)*r;
        let tangentZ = (deltaPos12 * deltaUV21 - deltaPos22 * deltaUV11)*r;
        for( let j = 0; j < 3; j++ ){
            tagents.push(tangentX);
            tagents.push(tangentY);
            tagents.push(tangentZ);
        }
        let bitangentX = (deltaPos20 * deltaUV10 - deltaPos10 * deltaUV20)*r;
        let bitangentY = (deltaPos21 * deltaUV10 - deltaPos11 * deltaUV20)*r;
        let bitangentZ = (deltaPos22 * deltaUV10 - deltaPos12 * deltaUV20)*r;
        for( let j = 0; j < 3; j++ ){
            bitagents.push(bitangentX);
            bitagents.push(bitangentY);
            bitagents.push(bitangentZ);
        }
    }
    let obj = {};
    obj['tagents'] = tagents;
    obj['bitagents'] = bitagents;
    obj['crossTexCoords'] = crossTexCoords;
    return obj;
}