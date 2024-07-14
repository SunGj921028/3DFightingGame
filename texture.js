//! variables
var textures = {};
var texCount = 0;
var numTextures = 1;

//! Cube Texture
function initCubeTexture(posXName, negXName, posYName, negYName, 
	posZName, negZName, imgWidth, imgHeight){
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

	const faceInfos = [
		{
                  target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                  fName: posXName,
		},
		{
                  target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                  fName: negXName,
		},
		{
                  target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                  fName: posYName,
		},
		{
                  target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                  fName: negYName,
		},
		{
                  target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                  fName: posZName,
		},
		{
                  target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                  fName: negZName,
		},
	];
	faceInfos.forEach((faceInfo) => {
		const {target, fName} = faceInfo;
		// setup each face so it's immediately renderable
		gl.texImage2D(target, 0, gl.RGBA, imgWidth, imgHeight, 0, 
		      gl.RGBA, gl.UNSIGNED_BYTE, null);

		var image = new Image();
        image.onload = function () {
            gl.activeTexture(gl.TEXTURE0); //!
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0); //!
			gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		};
		image.src = fName;
	});
	gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

	return texture;
}

//! Normal Texture
function initTexture(gl, img, textureKey){
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    textures[textureKey] = tex;
    texCount++;
    if (texCount == numTextures) { draw();}
}

//! load texture
async function load_all_texture() {
    var imageChess = new Image();
    imageChess.onload = function () {initTexture(gl, imageChess, "chessTex");};
    imageChess.src = "./texture/chess.jpg";

    var imageGround = new Image();
    imageGround.onload = function () {initTexture(gl, imageGround, "groundTex");};
    imageGround.src = "./texture/ground.jpeg";

    var imageWood = new Image();
    imageWood.onload = function () {initTexture(gl, imageWood, "woodTex");};
    imageWood.src = "./texture/wood.jpeg";

    var imageTable = new Image();
    imageTable.onload = function () {initTexture(gl, imageTable, "tableTex");};
    imageTable.src = "./texture/table.jpg";

    var imageTableChange = new Image();
    imageTableChange.onload = function () { initTexture(gl, imageTableChange, "tableChangeTex"); };
    imageTableChange.src = "./texture/table-change.jpg";

    var imageTowa1 = new Image();
    imageTowa1.onload = function () { initTexture(gl, imageTowa1, "towa1Tex"); };
    imageTowa1.src = "./texture/towa-1.jpg";

    var imageTowa4 = new Image();
    imageTowa4.onload = function () { initTexture(gl, imageTowa4, "towa4Tex"); };
    imageTowa4.src = "./texture/towa-4.jpg";

    var imageTowa5 = new Image();
    imageTowa5.onload = function () { initTexture(gl, imageTowa5, "towa5Tex"); };
    imageTowa5.src = "./texture/towa-5.jpg";

    var imagePlastic = new Image();
    imagePlastic.onload = function () { initTexture(gl, imagePlastic, "plasticTex"); };
    imagePlastic.src = "./texture/plastic.jpg";

    var imagePlate = new Image();
    imagePlate.onload = function () { initTexture(gl, imagePlate, "plateTex"); };
    imagePlate.src = "./texture/dif.jpg";

    var imageGlass = new Image();
    imageGlass.onload = function () { initTexture(gl, imageGlass, "glassTex"); };
    imageGlass.src = "./texture/glass.jpg";

    var imagemetal = new Image();
    imagemetal.onload = function () { initTexture(gl, imagemetal, "metalTex"); };
    imagemetal.src = "./texture/metal.jpg";

    var imageCat = new Image();
    imageCat.onload = function () { initTexture(gl, imageCat, "catTex"); };
    imageCat.src = "./texture/Cat_diffuse.jpg";

    var imageRock = new Image();
    imageRock.onload = function () { initTexture(gl, imageRock, "rockTex"); };
    imageRock.src = "./texture/rock.jpg";

    var imageRock2 = new Image();
    imageRock2.onload = function () { initTexture(gl, imageRock2, "rock2Tex"); };
    imageRock2.src = "./texture/rock2.jpg";

    var imageStone = new Image();
    imageStone.onload = function () { initTexture(gl, imageStone, "stoneTex"); };
    imageStone.src = "./texture/Eucalyptus _DISP.jpg";

    var imageNormalMap = new Image();
    imageNormalMap.onload = function () { initTexture(gl, imageNormalMap, "foxNormalMapTex"); };
    imageNormalMap.src = "./normalMap/foxnormal.jpeg";

    var imageBrick = new Image();
    imageBrick.onload = function () { initTexture(gl, imageBrick, "brickTex"); };
    imageBrick.src = "./texture/castleDiff.jpg";

    var imageNormalMap3 = new Image();
    imageNormalMap3.onload = function () { initTexture(gl, imageNormalMap3, "castleNorTex"); };
    imageNormalMap3.src = "./normalMap/castleNor.png";

    var imageNormalMap4 = new Image();
    imageNormalMap4.onload = function () { initTexture(gl, imageNormalMap4, "brickNorTex"); };
    imageNormalMap4.src = "./normalMap/hole.jpg";

    // var imageNormalMap2 = new Image();
    // imageNormalMap2.onload = function () { initTexture(gl, imageNormalMap2, "holeNormalMapTex"); };
    // imageNormalMap2.src = "./normalMap/hole.png";

    // var imageSword = new Image();
    // imageSword.onload = function () { initTexture(gl, imageSword, "swordTex"); };
    // imageSword.src = "./texture/Texture.jpg";
}