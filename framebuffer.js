//* This JS file is for setting up the frame buffer for off-screen rendering
function initFrameBuffer() {
    //create and set up a texture object as the color buffer
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        offScreenWidth,
        offScreenHeight,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    //create and setup a render buffer as the depth buffer
    var depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(
        gl.RENDERBUFFER,
        gl.DEPTH_COMPONENT16,
        offScreenWidth,
        offScreenHeight
    );

    //create and setup framebuffer: linke the color and depth buffer to it
    var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
    );
    gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        depthBuffer
    );
    frameBuffer.texture = texture;
    return frameBuffer;
}

function initFrameBufferForCubemapRendering(){
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
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 
							offScreenWidth, offScreenHeight);

	//create and setup framebuffer: linke the depth buffer to it (no color buffer here)
	var frameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, 
								gl.RENDERBUFFER, depthBuffer);

	frameBuffer.texture = texture;

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	return frameBuffer;
}
