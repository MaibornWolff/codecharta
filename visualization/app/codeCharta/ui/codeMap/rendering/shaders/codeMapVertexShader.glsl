#define saturate(a) clamp( a, 0.0, 1.0)
#define RECIPROCAL_PI 0.31830988618
#define PI 3.14159265359

attribute vec3 color;
attribute vec3 deltaColor;
attribute lowp float delta;

varying vec3 vWorldNormal;
varying lowp float vDelta;
varying vec2 vUV;
varying vec4 vOutgoingDiffuseColor;
varying vec4 vOutgoingDiffuseDeltaColor;

uniform vec3 ambientLightColor;

struct DirectionalLight {
    vec3 direction;
    vec3 color;
};
uniform DirectionalLight directionalLights[NUM_DIR_LIGHTS];

struct IncidentLight {
    vec3 color;
    vec3 direction;
};

struct ReflectedLight {
    vec3 directDiffuse;
    vec3 directSpecular;
    vec3 indirectDiffuse;
    vec3 indirectSpecular;
};

void getDirectionalDirectLightIrradiance(const in DirectionalLight directionalLight,out IncidentLight directLight) {
    directLight.color = directionalLight.color;
    directLight.direction = directionalLight.direction;
}

vec3 BRDF_Diffuse_Lambert (const in vec3 diffuseColor) {
    return RECIPROCAL_PI * diffuseColor;
}

vec3 getAmbientLightIrradiance() {
    return ambientLightColor*PI;
}

vec3 getBaseOutgoingLight(const vec3 lightFront) {
    ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    reflectedLight.indirectDiffuse = getAmbientLightIrradiance();
    reflectedLight.directDiffuse = lightFront;
    return (reflectedLight.directDiffuse + reflectedLight.indirectDiffuse);
}

// better to calc the colors in vertex as no color interpolation is used, performance improvements will be noticeable 
// once frustum or occlusion culling is properly used

void main() 
{
	vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * modelViewPosition;

    vec3 worldNormal = vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vec3 normal= normalize(normalMatrix * normal);
    vec3 lightFront = vec3(0.0);

    vUV = uv;
    vDelta = abs(delta);

    for (int i=0; i < 2; ++i)   // do we really need 2 directionallights ?
    {
        IncidentLight directLight;

        getDirectionalDirectLightIrradiance(directionalLights[i],directLight);
        float dotNL = dot(normal, directLight.direction);
        vec3 directLightColor_Diffuse = PI * directLight.color; 
        lightFront += saturate(dotNL) * directLightColor_Diffuse;
    }

    vec3 baseOutgoingLight = getBaseOutgoingLight(lightFront);
    
    vOutgoingDiffuseColor = vec4(BRDF_Diffuse_Lambert(color.rgb)*baseOutgoingLight,1.0);
    vOutgoingDiffuseDeltaColor = vec4(BRDF_Diffuse_Lambert(deltaColor)*baseOutgoingLight,1.0);
}