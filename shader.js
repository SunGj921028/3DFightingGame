//! Main shader for rendering
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec4 a_Normal;
    attribute vec2 a_TexCoord;
    uniform mat4 u_MvpMatrix;
    uniform mat4 u_modelMatrix;
    uniform mat4 u_normalMatrix;
    uniform mat4 u_MvpMatrixOfLight;
    varying vec4 v_PositionFromLight; //* For shadow
    varying vec3 v_Normal;
    varying vec3 v_PositionInWorld;
    varying vec2 v_TexCoord;
    //? For bump mapping
    attribute vec3 a_Tagent;
    attribute vec3 a_Bitagent;
    attribute float a_crossTexCoord;
    varying mat4 v_TBN;

    void main(){
        gl_Position = u_MvpMatrix * a_Position;
        v_PositionInWorld = (u_modelMatrix * a_Position).xyz; 
        v_Normal = normalize(vec3(u_normalMatrix * a_Normal));
        v_TexCoord = a_TexCoord;
        v_PositionFromLight = u_MvpMatrixOfLight * a_Position; //*for shadow
        //? create TBN matrix
        vec3 tagent = normalize(a_Tagent);
        vec3 bitagent = normalize(a_Bitagent);
        vec3 nVector;
        if( a_crossTexCoord > 0.0){
          nVector = cross(tagent, bitagent);
        } else{
          nVector = cross(bitagent, tagent);
        }
        v_TBN = mat4(tagent.x, tagent.y, tagent.z, 0.0, 
                           bitagent.x, bitagent.y, bitagent.z, 0.0,
                           nVector.x, nVector.y, nVector.z, 0.0, 
                           0.0, 0.0, 0.0, 1.0);
    }
`;

var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec3 u_LightPosition;
    uniform vec3 u_ViewPosition;
    uniform float u_Ka;
    uniform float u_Kd;
    uniform float u_Ks;
    uniform float u_shininess;
    uniform vec3 u_Color;
    varying vec3 v_Normal;
    varying vec3 v_PositionInWorld;
    varying vec2 v_TexCoord;
    uniform sampler2D u_Sampler;
    uniform sampler2D u_ShadowMap; //! shadow
    varying vec4 v_PositionFromLight; //! shadow
    const float deMachThreshold = 0.0007; //! shadow, 0.001 if having high precision depth
    uniform int is_texture;
    //? For bump mapping
    uniform mat4 u_normalMatrix;
    varying mat4 v_TBN;
    uniform bool u_normalMapMode;
    uniform sampler2D u_Sampler2;

    float unpack(const in vec4 rgbaDepth) {
        const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
        return dot(rgbaDepth, bitShift);
    }

    void main(){
        //! texture
        vec3 texColor;
        if(is_texture == 0){
            texColor = u_Color;
        }else{
            texColor = texture2D(u_Sampler, v_TexCoord).rgb;
        }

        // let ambient and diffuse color are u_Color 
        // (you can also input them from ouside and make them different)
        vec3 ambientLightColor = texColor;
        vec3 diffuseLightColor = texColor;
        // assume white specular light (you can also input it from ouside)
        vec3 specularLightColor = vec3(1.0, 1.0, 1.0);

        vec3 ambient = ambientLightColor * u_Ka;

        //? For bump mapping
        vec3 normal;
        if(u_normalMapMode){
          //* normal vector from normal map
          vec3 nMapNormal = normalize( texture2D( u_Sampler2, v_TexCoord ).rgb * 2.0 - 1.0 );
          normal = normalize( vec3( u_normalMatrix * v_TBN * vec4( nMapNormal, 1.0) ) );
        }else{
          //* 3D object normal vector 
          normal = normalize(v_Normal);
        }

        vec3 lightDirection = normalize(u_LightPosition - v_PositionInWorld);
        float nDotL = max(dot(lightDirection, normal), 0.0);
        vec3 diffuse = diffuseLightColor * u_Kd * nDotL;

        vec3 specular = vec3(0.0, 0.0, 0.0);
        if(nDotL > 0.0) {
            vec3 R = reflect(-lightDirection, normal);
            // V: the vector, point to viewer       
            vec3 V = normalize(u_ViewPosition - v_PositionInWorld); 
            float specAngle = clamp(dot(R, V), 0.0, 1.0);
            specular = u_Ks * pow(specAngle, u_shininess) * specularLightColor; 
        }

        //* shadow
        // vec3 shadowCoord = (v_PositionFromLight.xyz/v_PositionFromLight.w)/2.0 + 0.5;
        // vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy);
        // //? LOW precision depth implementation
        // float depth = rgbaDepth.r;
        // float visibility = (shadowCoord.z > depth + deMachThreshold) ? 0.3 : 1.0;
        
        // gl_FragColor = vec4( (ambient + diffuse + specular) * visibility, 1.0 );
        
        // //TODO High precision depth implementation --- in progress
        vec3 shadowCoord = (v_PositionFromLight.xyz/v_PositionFromLight.w)/2.0 + 0.5;
        float shadows = 0.0;
        float opacity = 0.6;
        float texelSize = 1.0/2048.0;
        vec4 rgbaDepth;
        for(float y = -3.0; y <= 3.0; y += 1.0){
            for(float x = -3.0; x <= 3.0; x += 1.0){
                rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy + vec2(x,y) * texelSize);
                shadows += ( ( (shadowCoord.z - deMachThreshold) > unpack(rgbaDepth) ) ? 1.0 : 0.1 );
            }
        }
        shadows /= 36.0;
        float visibility = min(opacity + (1.0 - shadows), 1.0);
        specular = visibility < 1.0 ? vec3(0.0, 0.0, 0.0): specular;
        gl_FragColor = vec4( (ambient + diffuse + specular) * visibility, texture2D( u_Sampler, v_TexCoord ).a);
    }
`;

//! For shadow
var VSHADER_SHADOW_SOURCE = `
      attribute vec4 a_Position;
      uniform mat4 u_MvpMatrix;
      void main(){
          gl_Position = u_MvpMatrix * a_Position;
      }
  `;

var FSHADER_SHADOW_SOURCE = `
      precision mediump float;
      vec4 pack (float depth) {
          const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
          const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);
          vec4 rgbaDepth = fract(depth * bitShift);
          rgbaDepth -= rgbaDepth.gbaa * bitMask;
          return rgbaDepth;
      }
      void main(){
        /////////** LOW precision depth implementation **/////
        // gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 1.0);
        gl_FragColor = pack(gl_FragCoord.z);
      }
  `;

//! For environment cube mapping
var VSHADER_SOURCE_ENVCUBE = `
  attribute vec4 a_Position;
  varying vec4 v_Position;
  void main() {
    v_Position = a_Position;
    gl_Position = a_Position;
  } 
`;

var FSHADER_SOURCE_ENVCUBE = `
  precision mediump float;
  uniform samplerCube u_envCubeMap;
  uniform mat4 u_viewDirectionProjectionInverse; //! because (Mproj * Mview)^-1 * Cclip= Cworld
  varying vec4 v_Position;
  void main() {
    vec4 t = u_viewDirectionProjectionInverse * v_Position;
    gl_FragColor = textureCube(u_envCubeMap, normalize(t.xyz / t.w));
  }
`;

//! For source texture mapping on cube
var VSHADER_SOURCE_TEXTURE_ON_CUBE = `
  attribute vec4 a_Position;
  attribute vec4 a_Normal;
  uniform mat4 u_MvpMatrix;
  uniform mat4 u_modelMatrix;
  uniform mat4 u_normalMatrix;
  varying vec4 v_TexCoord;
  varying vec3 v_Normal;
  varying vec3 v_PositionInWorld;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
    v_TexCoord = a_Position;
    v_PositionInWorld = (u_modelMatrix * a_Position).xyz; 
    v_Normal = normalize(vec3(u_normalMatrix * a_Normal));
  } 
`;

var FSHADER_SOURCE_TEXTURE_ON_CUBE = `
  precision mediump float;
  varying vec4 v_TexCoord;
  uniform vec3 u_ViewPosition;
  uniform vec3 u_Color;
  uniform samplerCube u_envCubeMap;
  varying vec3 v_Normal;
  varying vec3 v_PositionInWorld;
  void main() {
    vec3 V = normalize(u_ViewPosition - v_PositionInWorld); 
    vec3 normal = normalize(v_Normal);
    vec3 R = reflect(-V, normal);
    gl_FragColor = vec4(0.78 * textureCube(u_envCubeMap, R).rgb + 0.3 * u_Color, 1.0);
  }
`;