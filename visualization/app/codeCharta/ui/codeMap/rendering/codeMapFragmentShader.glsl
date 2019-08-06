varying vec3 vColor;
varying vec3 vDeltaColor;
varying vec3 worldNormal;
varying vec3 vLightFront;
varying highp float vDelta;
varying vec2 vUV;

uniform vec3 ambientLightColor;

#define RECIPROCAL_PI 0.31830988618
#define PI 3.14159265359

struct ReflectedLight {
    vec3 directDiffuse;
    vec3 directSpecular;
    vec3 indirectDiffuse;
    vec3 indirectSpecular;
};

vec3 getAmbientLightIrradiance(const in vec3 ambientLightColor) {
    vec3 irradiance = ambientLightColor;
    irradiance *= PI;
    return irradiance;
}

vec3 BRDF_Diffuse_Lambert (const in vec3 diffuseColor) {
    return RECIPROCAL_PI * diffuseColor;
}

bool normalPointingUp(const in vec3 normal)
{
    return normal.y > 0.9;
}

struct Rect {
    vec2 min;
    vec2 max;
};

bool uvCoordInRectangle(const in vec2 uv, const in Rect r)
{
    return uv.x >= r.min.x && uv.x < r.max.x && uv.y >= r.min.y && uv.y < r.max.y;
}

void main() {
    vec4 diffuseColor = vec4(vColor, 1.0);

    const float epsilon = 0.5;
    const float minDelta = 0.001;

    bool isTop = normalPointingUp(worldNormal);

    if (abs(vDelta) > minDelta && (vUV.y > 1.0 - abs(vDelta) || isTop))
    {
        diffuseColor.xyz = vDeltaColor;
    }

    ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    reflectedLight.indirectDiffuse = getAmbientLightIrradiance(ambientLightColor);
    reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert(diffuseColor.rgb);

    reflectedLight.directDiffuse = vLightFront;
    reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert(diffuseColor.rgb);

    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;

    gl_FragColor = vec4(outgoingLight, diffuseColor.a);
}
