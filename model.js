//! Variables for object models
var cubeObj = [];
var tableObj = [];
var sphereObj = [];
var playerObj = [];
var enemyObj = [];
var catObj = [];
var swordObj = [];

var sonicObj = [];

//! get all the model we need
async function getAllModelData() { 
    //TODO Load all models
    cubeObj = await load_model("./object/cube.obj");
    tableObj = await load_model("./object/table.obj");
    sphereObj = await load_model("./object/sphere.obj");
    playerObj = await load_model("./object/11073_Knight_V5.obj");
    enemyObj = await load_model("./object/Stone.obj");
    catObj = await load_model("./object/12221_Cat_v1_l3.obj");
    swordObj = await load_model("./object/Sting-Sword-lowpoly.obj");
    sonicObj = await load_model("./object/sonic.obj");
}

//! Load model function
async function load_model(dataPath) { 
    let obj_data = [];
    let response = await fetch(dataPath);
    let text = await response.text();
    let object = parseOBJ(text);
    for (let i = 0; i < object.geometries.length; i++) {
        let tagentSpace = calculateTangentSpace(object.geometries[i].data.position, object.geometries[i].data.texcoord);
        let o = initVertexBufferForLaterUse(
            gl,
            object.geometries[i].data.position,
            object.geometries[i].data.normal,
            object.geometries[i].data.texcoord,
            tagentSpace.tagents,
            tagentSpace.bitagents,
            tagentSpace.crossTexCoords
        );
        obj_data.push(o);
    }
    return obj_data;
}

//! parse obj file
function parseOBJ(text) {
    // because indices are base 1 let's just fill in the 0th data
    const objPositions = [[0, 0, 0]];
    const objTexcoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];

    // same order as `f` indices
    const objVertexData = [objPositions, objTexcoords, objNormals];

    // same order as `f` indices
    let webglVertexData = [
        [], // positions
        [], // texcoords
        [], // normals
    ];

    const materialLibs = [];
    const geometries = [];
    let geometry;
    let groups = ["default"];
    let material = "default";
    let object = "default";

    const noop = () => {};

    function newGeometry() {
        // If there is an existing geometry and it's
        // not empty then start a new one.
        if (geometry && geometry.data.position.length) {
            geometry = undefined;
        }
    }

    function setGeometry() {
        if (!geometry) {
            const position = [];
            const texcoord = [];
            const normal = [];
            webglVertexData = [position, texcoord, normal];
            geometry = {
                object,
                groups,
                material,
                data: {
                    position,
                    texcoord,
                    normal,
                },
            };
            geometries.push(geometry);
        }
    }

    function addVertex(vert) {
        const ptn = vert.split("/");
        ptn.forEach((objIndexStr, i) => {
            if (!objIndexStr) {
                return;
            }
            const objIndex = parseInt(objIndexStr);
            const index =
                objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
            webglVertexData[i].push(...objVertexData[i][index]);
        });
    }

    const keywords = {
        v(parts) {
            objPositions.push(parts.map(parseFloat));
        },
        vn(parts) {
            objNormals.push(parts.map(parseFloat));
        },
        vt(parts) {
            // should check for missing v and extra w?
            objTexcoords.push(parts.map(parseFloat));
        },
        f(parts) {
            setGeometry();
            const numTriangles = parts.length - 2;
            for (let tri = 0; tri < numTriangles; ++tri) {
                addVertex(parts[0]);
                addVertex(parts[tri + 1]);
                addVertex(parts[tri + 2]);
            }
        },
        s: noop, // smoothing group
        mtllib(parts, unparsedArgs) {
            // the spec says there can be multiple filenames here
            // but many exist with spaces in a single filename
            materialLibs.push(unparsedArgs);
        },
        usemtl(parts, unparsedArgs) {
            material = unparsedArgs;
            newGeometry();
        },
        g(parts) {
            groups = parts;
            newGeometry();
        },
        o(parts, unparsedArgs) {
            object = unparsedArgs;
            newGeometry();
        },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split("\n");
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === "" || line.startsWith("#")) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn("unhandled keyword:", keyword); // eslint-disable-line no-console
            continue;
        }
        handler(parts, unparsedArgs);
    }

    // remove any arrays that have no entries.
    for (const geometry of geometries) {
        geometry.data = Object.fromEntries(
            Object.entries(geometry.data).filter(
                ([, array]) => array.length > 0
            )
        );
    }

    return {
        geometries,
        materialLibs,
    };
}


