//! This JS file is for functions for drawing something

//! Variables of model matrix from light
var groundMvpFromLight = new Matrix4();
var obstacleMvpFromLight = new Matrix4();
var playerMvpFromLight = new Matrix4();
var enemyMvpFromLight = new Matrix4();
var catMvpFromLight = new Matrix4();
var swordMvpFromLight = new Matrix4();
var heartMvpFromLight = new Matrix4();

var bumpMappingMvpFromLight = new Matrix4();
var reflectionMvpFromLight = new Matrix4();

//! draw object other than reflection object
function drawOneRegularObject(obj, mdlMatrix, mvpFromLight, vpMatrix, curCameraX, curCameraY, curCameraZ, textureName) { 
    gl.useProgram(program);
    var mvpMatrix = new Matrix4();
    mvpMatrix.set(vpMatrix);

    //! Model matrix
    mvpMatrix.multiply(mdlMatrix);

    var normalMatrix = new Matrix4();
    normalMatrix.setInverseOf(mdlMatrix);
    normalMatrix.transpose();

    //! uniform variables
    gl.uniform3f(program.u_LightPosition, lightX, lightY, lightZ);
    gl.uniform3f(program.u_ViewPosition, curCameraX, curCameraY, curCameraZ);
    gl.uniform1f(program.u_Ka, 0.4);
    gl.uniform1f(program.u_Kd, 0.7);
    gl.uniform1f(program.u_Ks, 0.5);
    gl.uniform1f(program.u_shininess, 30.0);
    gl.uniform3f(program.u_Color, 1.0, 0.0, 0.0); //? If color is used, it will be change by variables
    gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(program.u_modelMatrix, false, mdlMatrix.elements);
    gl.uniformMatrix4fv(program.u_normalMatrix, false, normalMatrix.elements);

    gl.uniformMatrix4fv(program.u_MvpMatrixOfLight, false, mvpFromLight.elements);

    //! change texture
    if (textureName == "color") {
        gl.uniform1i(program.is_texture, 0);
    } else { 
        gl.uniform1i(program.is_texture, 1);
    }

    gl.uniform1i(program.u_normalMapMode, normalmode);
    //! For texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[textureName]);
    gl.uniform1i(program.u_Sampler, 0);
    //! For shadow
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, shadowFBO.texture);
    gl.uniform1i(program.u_ShadowMap, 1);
    //? For bump mapping
    gl.activeTexture(gl.TEXTURE2);
    if (textureName == "brickTex") {
        gl.bindTexture(gl.TEXTURE_2D, textures["castleNorTex"]);
    } else { 
        gl.bindTexture(gl.TEXTURE_2D, textures["brickNorTex"]);
    }
    gl.uniform1i(program.u_Sampler2, 2);

    //! Draw
    for (let i = 0; i < obj.length; i++) {
        initAttributeVariable(gl, program.a_Position, obj[i].vertexBuffer);
        initAttributeVariable(gl, program.a_TexCoord, obj[i].texCoordBuffer);
        initAttributeVariable(gl, program.a_Normal, obj[i].normalBuffer);
        initAttributeVariable(gl, program.a_Tagent, obj[i].tagentsBuffer);//!
        initAttributeVariable(gl, program.a_Bitagent, obj[i].bitagentsBuffer);//!
        initAttributeVariable(gl, program.a_crossTexCoord, obj[i].crossTexCoordsBuffer);//!
        gl.drawArrays(gl.TRIANGLES, 0, obj[i].numVertices);
    }
}

function drawObjects(vpMatrix) { 
    //! Might need to judge camera direction for first person view and third person view
    var curCameraX = thirdPersonView == 0 ? cameraX : cameraXThird;
    var curCameraY = thirdPersonView == 0 ? cameraY : cameraYThird;
    var curCameraZ = thirdPersonView == 0 ? cameraZ : cameraZThird;

    normalmode = 0;
    //? Draw ground
    drawOneRegularObject(cubeObj, groundModelMatrix, groundMvpFromLight, vpMatrix, curCameraX, curCameraY, curCameraZ, "towa1Tex");
    //? Draw player
    drawOneRegularObject(playerObj, playerModelMatrix, playerMvpFromLight, vpMatrix, curCameraX, curCameraY, curCameraZ, "stoneTex");
    //? Draw enemy
    drawOneRegularObject(enemyObj, enemyModelMatrix, enemyMvpFromLight, vpMatrix, curCameraX, curCameraY, curCameraZ, "rock2Tex");
    //? Draw cat
    // drawOneRegularObject(catObj, catModelMatrix, catMvpFromLight, vpMatrix, curCameraX, curCameraY, curCameraZ, "catTex");
    //? Draw sword
    drawOneRegularObject(swordObj, swordModelMatrix, swordMvpFromLight, vpMatrix, curCameraX, curCameraY, curCameraZ, "tableChangeTex");
    //? Draw heart
    drawOneRegularObject(cubeObj, heartModelMatrix, heartMvpFromLight, vpMatrix, curCameraX, curCameraY, curCameraZ, "color");
    normalmode = 1;
    //? Draw bump mapping
    drawOneRegularObject(cubeObj, ModelMatrixForBumpMapping, bumpMappingMvpFromLight, vpMatrix, curCameraX, curCameraY, curCameraZ, "brickTex");
    //? Draw obstacle
    drawOneRegularObject(cubeObj, obstacleModelMatrix, obstacleMvpFromLight, vpMatrix, curCameraX, curCameraY, curCameraZ, "woodTex");
}

//! draw for environment cube map
function drawEnvCubeMap(vMatrix, pMatrix) { 
    // if (!isTexture) {
    //     var vpFromCamera = new Matrix4();
    //     vpFromCamera.setPerspective(60, 1, 1, 15);
    //     var viewMatrixRotationOnly = new Matrix4();
    //     viewMatrixRotationOnly.lookAt(
    //         cameraX,
    //         cameraY,
    //         cameraZ,
    //         cameraX + newViewDir.elements[0],
    //         cameraY + newViewDir.elements[1],
    //         cameraZ + newViewDir.elements[2],
    //         0,
    //         1,
    //         0
    //     );
    //     viewMatrixRotationOnly.elements[12] = 0; //ignore translation
    //     viewMatrixRotationOnly.elements[13] = 0;
    //     viewMatrixRotationOnly.elements[14] = 0;
    //     vpFromCamera.multiply(viewMatrixRotationOnly);
    //     var vpFromCameraInverse = vpFromCamera.invert();
    // } else { 
    //     var vpFromCameraInverse = new Matrix4();
    //     vpFromCameraInverse.set(pMatrix);
    //     vpFromCameraInverse.multiply(vMatrix);
    //     vpFromCameraInverse.invert();
    // }
    var vpFromCamera = new Matrix4();
    vpFromCamera.set(pMatrix);
    vMatrix.elements[12] = 0; //ignore translation
    vMatrix.elements[13] = 0;
    vMatrix.elements[14] = 0;
    vpFromCamera.multiply(vMatrix);
    var vpFromCameraInverse = vpFromCamera.invert();
    
    
    //! draw the cube map
    gl.useProgram(programEnvCube);
    gl.depthFunc(gl.LEQUAL);
    gl.uniformMatrix4fv(programEnvCube.u_viewDirectionProjectionInverse, false, vpFromCameraInverse.elements);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMapTex);
    gl.uniform1i(programEnvCube.u_envCubeMap, 0);
    initAttributeVariable(gl, programEnvCube.a_Position, quadObj.vertexBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, quadObj.numVertices);
}

//! draw for shadow
function drawOneObjectOnShadowFBO(obj, mdlMatrix) { 
    var mvpFromLight = new Matrix4();
    mvpFromLight.setPerspective(150, offScreenWidth / offScreenHeight, 1, 1000);
    mvpFromLight.lookAt(lightX, lightY, lightZ, 5, 0, 0, 0, 1, 0);
    mvpFromLight.multiply(mdlMatrix);

    gl.useProgram(shadowProgram);
    gl.uniformMatrix4fv(shadowProgram.u_MvpMatrix, false, mvpFromLight.elements);

    for (let i = 0; i < obj.length; i++) { 
        initAttributeVariable(gl, shadowProgram.a_Position, obj[i].vertexBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, obj[i].numVertices);
    }
    return mvpFromLight;
}

function drawObjectsShadow() { 
    normalmode = 0;
    //* Ground
    groundMvpFromLight = drawOneObjectOnShadowFBO(cubeObj, groundModelMatrix);
    //* Player
    playerMvpFromLight = drawOneObjectOnShadowFBO(playerObj, playerModelMatrix);
    //* enemy
    enemyMvpFromLight = drawOneObjectOnShadowFBO(enemyObj, enemyModelMatrix);
    //* cat
    // catMvpFromLight = drawOneObjectOnShadowFBO(catObj, catModelMatrix);
    //* Sword
    swordMvpFromLight = drawOneObjectOnShadowFBO(swordObj, swordModelMatrix);
    //* Heart
    heartMvpFromLight = drawOneObjectOnShadowFBO(cubeObj, heartModelMatrix);
    //* Reflection object
    reflectionMvpFromLight = drawOneObjectOnShadowFBO(sphereObj, ModelMatrixForReflectionObj);
    normalmode = 1;
    //* Bump mapping
    bumpMappingMvpFromLight = drawOneObjectOnShadowFBO(cubeObj, ModelMatrixForBumpMapping);
    //* obstacle
    obstacleMvpFromLight = drawOneObjectOnShadowFBO(cubeObj, obstacleModelMatrix);
}

function setDrawShadow() { 
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    drawObjectsShadow();
}

//! Draw reflection objects
//? Render on frameBufferObject
function renderCubeMap(camX, camY, camZ){
    //camera 6 direction to render 6 cubemap faces
    var ENV_CUBE_LOOK_DIR = [
        [1.0, 0.0, 0.0],
        [-1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, -1.0, 0.0],
        [0.0, 0.0, 1.0],
        [0.0, 0.0, -1.0],
    ];

    //camera 6 look up vector to render 6 cubemap faces
    var ENV_CUBE_LOOK_UP = [
        [0.0, -1.0, 0.0],
        [0.0, -1.0, 0.0],
        [0.0, 0.0, 1.0],
        [0.0, 0.0, -1.0],
        [0.0, -1.0, 0.0],
        [0.0, -1.0, 0.0],
    ];

    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindFramebuffer(gl.FRAMEBUFFER, dynamicReflectionFBO);
    gl.viewport(0, 0, offScreenWidth, offScreenHeight);
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    for (var side = 0; side < 6; side++){
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, 
                                gl.TEXTURE_CUBE_MAP_POSITIVE_X + side, dynamicReflectionFBO.texture, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let vMatrix = new Matrix4();
        let pMatrix = new Matrix4();
        pMatrix.setPerspective(90, 1, 1, 100);
        vMatrix.lookAt(camX, camY, camZ,   
                        camX + ENV_CUBE_LOOK_DIR[side][0], 
                        camY + ENV_CUBE_LOOK_DIR[side][1],
                        camZ + ENV_CUBE_LOOK_DIR[side][2], 
                        ENV_CUBE_LOOK_UP[side][0],
                        ENV_CUBE_LOOK_UP[side][1],
                        ENV_CUBE_LOOK_UP[side][2]);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        let vpMatrix = new Matrix4();
        vpMatrix.set(pMatrix);
        vpMatrix.multiply(vMatrix);

        drawEnvCubeMap(vMatrix, pMatrix);
        drawObjects(vpMatrix);
    }
}

function drawOneDynamicReflectionObject(obj, mdlMatrix, vpMatrix, curCameraX, curCameraY, curCameraZ) { 
    // renderCubeMap(posX, posY, posZ);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(programTextureOnCube);
    let mvpMatrix = new Matrix4();
    mvpMatrix.set(vpMatrix);
    mvpMatrix.multiply(mdlMatrix);

    //normal matrix
    let normalMatrix = new Matrix4();
    normalMatrix.setInverseOf(mdlMatrix);
    normalMatrix.transpose();
    
    gl.uniform3f(programTextureOnCube.u_ViewPosition, curCameraX, curCameraY, curCameraZ);
    gl.uniform3f(programTextureOnCube.u_Color, 0.15, 0.15, 0.15);
    gl.uniformMatrix4fv(programTextureOnCube.u_MvpMatrix, false, mvpMatrix.elements);
	gl.uniformMatrix4fv(programTextureOnCube.u_modelMatrix, false, mdlMatrix.elements);
    gl.uniformMatrix4fv(programTextureOnCube.u_normalMatrix, false, normalMatrix.elements);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, dynamicReflectionFBO.texture);
    gl.uniform1i(programTextureOnCube.u_envCubeMap, 2);

    for( let i=0; i < obj.length; i ++ ){
		initAttributeVariable(gl, programTextureOnCube.a_Position, obj[i].vertexBuffer);
		initAttributeVariable(gl, programTextureOnCube.a_Normal, obj[i].normalBuffer);
		gl.drawArrays(gl.TRIANGLES, 0, obj[i].numVertices);
	}
}

function drawReflectionObjects(vpMatrix) { 
    //! Might need to judge camera direction for first person view and third person view
    var curCameraX = thirdPersonView == 0 ? cameraX : cameraXThird;
    var curCameraY = thirdPersonView == 0 ? cameraY : cameraYThird;
    var curCameraZ = thirdPersonView == 0 ? cameraZ : cameraZThird;

    //! draw objects
    drawOneDynamicReflectionObject(sphereObj, ModelMatrixForReflectionObj, vpMatrix, curCameraX, curCameraY, curCameraZ);
}

//! Draw everything
function draw() { 
    renderCubeMap(positionX, positionY, positionZ); //? Where the object is
    var viewDir = new Vector3([cameraDirX, cameraDirY, cameraDirZ]);
    var rotateMatrix = new Matrix4();
    //! the direction are different
    rotateMatrix.setRotate(angleX, 0, -1, 0); //for mouse rotation
    rotateMatrix.rotate(angleY, 0, 0, -1); //for mouse rotation
    var newViewDir = rotateMatrix.multiplyVector3(viewDir);
    // console.log(newViewDir.elements);
    var vMatrix = new Matrix4();
    var pMatrix = new Matrix4();
    pMatrix.setPerspective(60, 1, 1, 100);
    var nowCameraX = thirdPersonView == 0 ? cameraX : cameraXThird;
    var nowCameraY = thirdPersonView == 0 ? cameraY : cameraYThird;
    var nowCameraZ = thirdPersonView == 0 ? cameraZ : cameraZThird;
    vMatrix.lookAt(
        nowCameraX,
        nowCameraY,
        nowCameraZ,
        nowCameraX + newViewDir.elements[0],
        nowCameraY + newViewDir.elements[1],
        nowCameraZ + newViewDir.elements[2],
        0,
        1,
        0
    );
    var vpMatrix = new Matrix4();
    vpMatrix.set(pMatrix);
    vpMatrix.multiply(vMatrix);
    
    //? Set the model matrix
    setMat();
    
    //? Draw shadow
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFBO);
    gl.viewport(0, 0, offScreenWidth, offScreenHeight);
    gl.clearColor(0.4, 0.4, 0.4, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    setDrawShadow();

    //? Draw cube map
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); //* Switch back to the default framebuffer
    gl.viewport(0, -275, canvas.width, canvas.width);
    gl.clearColor(0.4, 0.4, 0.4, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    // console.log(vMatrix.elements);
    drawEnvCubeMap(vMatrix, pMatrix);
    //? Draw regular objects
    drawObjects(vpMatrix);

    //? Draw reflection objects
    drawReflectionObjects(vpMatrix);
}