//! For shader
function initDynamicReflectionShaderProgram() { 
    programTextureOnCube = compileShader(gl, VSHADER_SOURCE_TEXTURE_ON_CUBE, FSHADER_SOURCE_TEXTURE_ON_CUBE);
    programTextureOnCube.a_Position = gl.getAttribLocation(programTextureOnCube, 'a_Position'); 
    programTextureOnCube.a_Normal = gl.getAttribLocation(programTextureOnCube, 'a_Normal'); 
    programTextureOnCube.u_MvpMatrix = gl.getUniformLocation(programTextureOnCube, 'u_MvpMatrix'); 
    programTextureOnCube.u_modelMatrix = gl.getUniformLocation(programTextureOnCube, 'u_modelMatrix'); 
    programTextureOnCube.u_normalMatrix = gl.getUniformLocation(programTextureOnCube, 'u_normalMatrix');
    programTextureOnCube.u_ViewPosition = gl.getUniformLocation(programTextureOnCube, 'u_ViewPosition');
    programTextureOnCube.u_envCubeMap = gl.getUniformLocation(programTextureOnCube, 'u_envCubeMap'); 
    programTextureOnCube.u_Color = gl.getUniformLocation(programTextureOnCube, 'u_Color'); 
}

function initOnScreenShaderProgram() { 
    program = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    program.a_Position = gl.getAttribLocation(program, "a_Position");
    program.a_Normal = gl.getAttribLocation(program, "a_Normal");
    program.u_MvpMatrix = gl.getUniformLocation(program, "u_MvpMatrix");
    program.u_modelMatrix = gl.getUniformLocation(program, "u_modelMatrix");
    program.u_normalMatrix = gl.getUniformLocation(program, "u_normalMatrix");
    program.u_LightPosition = gl.getUniformLocation(program, "u_LightPosition");
    program.u_ViewPosition = gl.getUniformLocation(program, "u_ViewPosition");
    program.u_Ka = gl.getUniformLocation(program, "u_Ka");
    program.u_Kd = gl.getUniformLocation(program, "u_Kd");
    program.u_Ks = gl.getUniformLocation(program, "u_Ks");
    program.u_shininess = gl.getUniformLocation(program, "u_shininess");
    program.u_Color = gl.getUniformLocation(program, "u_Color");
    program.u_Sampler = gl.getUniformLocation(program, "u_Sampler");
    program.is_texture = gl.getUniformLocation(program, "is_texture");
    program.u_ShadowMap = gl.getUniformLocation(program, "u_ShadowMap");
    program.u_MvpMatrixOfLight = gl.getUniformLocation(program, "u_MvpMatrixOfLight");
    program.a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
    //? For bump mapping
    program.a_Tagent = gl.getAttribLocation(program, "a_Tagent");
    program.a_Bitagent = gl.getAttribLocation(program, "a_Bitagent");
    program.a_crossTexCoord = gl.getAttribLocation(program, "a_crossTexCoord");
    program.u_normalMapMode = gl.getUniformLocation(program, "u_normalMapMode");
    program.u_Sampler2 = gl.getUniformLocation(program, "u_Sampler2");
}

function initShadowShaderProgram() { 
    shadowProgram = compileShader(gl,VSHADER_SHADOW_SOURCE,FSHADER_SHADOW_SOURCE);
    shadowProgram.a_Position = gl.getAttribLocation(shadowProgram,"a_Position");
    shadowProgram.u_MvpMatrix = gl.getUniformLocation(shadowProgram,"u_MvpMatrix");
}

function initCubeMapShaderProgram() { 
    var quad = new Float32Array([-1, -1, 1, 1, -1, 1, -1, 1, 1, -1, 1, 1, 1, -1, 1, 1, 1, 1,]); //just a quad
    programEnvCube = compileShader(gl, VSHADER_SOURCE_ENVCUBE, FSHADER_SOURCE_ENVCUBE);
	programEnvCube.a_Position = gl.getAttribLocation(programEnvCube, 'a_Position'); 
	programEnvCube.u_envCubeMap = gl.getUniformLocation(programEnvCube, 'u_envCubeMap'); 
	programEnvCube.u_viewDirectionProjectionInverse = 
        gl.getUniformLocation(programEnvCube, 'u_viewDirectionProjectionInverse');
    
    quadObj = initVertexBufferForLaterUse(gl, quad);
    cubeMapTex = initCubeTexture("./cubemap/pos-x.png", "./cubemap/neg-x.png", "./cubemap/pos-y.png", "./cubemap/neg-y.png", "./cubemap/pos-z.png", "./cubemap/neg-z.png", 512, 512);
}

//! For frame buffer object
function initFrameBufferForShadowRendering() {
    //create and set up a texture object as the color buffer
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, offScreenWidth, offScreenHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    //create and setup a render buffer as the depth buffer
    var depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, offScreenWidth, offScreenHeight);

    //create and setup framebuffer: linke the color and depth buffer to it
    var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    frameBuffer.texture = texture;
    return frameBuffer;
}

function initFrameBufferForCubemapRendering() { 
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    // 6 2D textures
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    for (let i = 0; i < 6; i++) {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, 
            gl.RGBA, offScreenWidth, offScreenHeight, 0, gl.RGBA, 
            gl.UNSIGNED_BYTE, null);
    }

    //create and setup a render buffer as the depth buffer
    var depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, offScreenWidth, offScreenHeight);

    //create and setup framebuffer: linke the depth buffer to it (no color buffer here)
    var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, 
        gl.RENDERBUFFER, depthBuffer);

    frameBuffer.texture = texture;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return frameBuffer;
}
