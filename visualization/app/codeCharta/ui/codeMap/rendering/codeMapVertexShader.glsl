#define PI 3.14159265359
#define saturate(a) clamp( a, 0.0, 1.0)

attribute vec3 color;
attribute vec3 defaultColor;
attribute vec3 deltaColor;
attribute highp float subGeomIdx;
attribute highp float delta;

varying vec3 vColor;
varying vec3 vDeltaColor;
varying vec3 worldNormal;
varying vec3 vLightFront;
varying highp float vDelta;
varying vec2 vUV;

struct GeometricContext {
    vec3 position;
    vec3 normal;
    vec3 viewDir;
};

struct DirectionalLight {
    vec3 direction;
    vec3 color;
    int shadow;
    float shadowBias;
    float shadowRadius;
    vec2 shadowMapSize;
};

struct IncidentLight {
    vec3 color;
    vec3 direction;
    bool visible;
};

uniform DirectionalLight directionalLights[NUM_DIR_LIGHTS];

void getDirectionalDirectLightIrradiance(const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight directLight) {
    directLight.color = directionalLight.color;
    directLight.direction = directionalLight.direction;
    directLight.visible = true;
}

void main() 
{
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * worldPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

	vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * modelViewPosition;

    worldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

    vec3 diffuse = vec3(1.0);
    
    GeometricContext geometry;
    geometry.position = viewPosition.xyz;
    geometry.normal = normalize(normalMatrix * normal);
    geometry.viewDir = normalize(-viewPosition.xyz);

    vLightFront = vec3(0.0);
    vUV = uv;
    vColor = color;
    vDeltaColor = deltaColor;
    vDelta = delta;

    for (int i=0; i < 2; ++i)
    {
        IncidentLight directLight;

        getDirectionalDirectLightIrradiance(directionalLights[i], geometry, directLight);
        float dotNL = dot(geometry.normal, directLight.direction);
        vec3 directLightColor_Diffuse = PI * directLight.color;
        vLightFront += saturate(dotNL) * directLightColor_Diffuse;
    }
}