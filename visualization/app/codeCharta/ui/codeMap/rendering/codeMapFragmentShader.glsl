#define MAX_NUM_HIGHLIGHTS_SELECTIONS 10

varying vec3 vColor;
varying vec3 worldNormal;
varying vec3 vLightFront;
varying highp float vDelta;
varying vec2 vUV;

uniform vec3 ambientLightColor;

uniform vec3 deltaColorPositive;
uniform vec3 deltaColorNegative;

#define RECIPROCAL_PI 0.31830988618
#define PI 3.14159265359

struct ReflectedLight {
    vec3 directDiffuse;
    vec3 directSpecular;
    vec3 indirectDiffuse;
    vec3 indirectSpecular;
};

vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
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

bool pixelInProceduralMinusArea(const in vec2 uv)
{
    float height = 0.1;
    float width = 0.35;

    float hh = height * 0.5;
    float hw = width * 0.5;

    float xMin = (1.0 - width) * 0.5;
    float xMax = xMin + width;

    float yMin = (1.0 - height) * 0.5;
    float yMax = yMin + height;

    return uvCoordInRectangle(vUV, Rect(vec2(xMin, yMin), vec2(xMax, yMax)));
}

bool pixelInProceduralPlusArea(const in vec2 uv)
{
float height = 0.1;
    float width = 0.35;

    float hh = height * 0.5;
    float hw = width * 0.5;

    float xMin = (1.0 - width) * 0.5;
    float xMax = xMin + width;

    float yMin = (1.0 - height) * 0.5;
    float yMax = yMin + height;

    Rect r1 = Rect(vec2(xMin, yMin), vec2(xMax, yMax));
    Rect r2 = Rect(vec2(yMin, xMin), vec2(yMax, xMax));

    return uvCoordInRectangle(uv, r1) || uvCoordInRectangle(uv, r2);
}

void main() {
    vec4 diffuseColor = vec4(vColor, 1.0);

    const float epsilon = 0.5;
    const float minDelta = 0.001;

    bool isTop = normalPointingUp(worldNormal);

    if (abs(vDelta) > minDelta && (vUV.y > 1.0 - abs(vDelta) || isTop))
    {
        if (vDelta > 0.0)
        {
            diffuseColor.xyz = deltaColorPositive;
        }
        else
        {
            diffuseColor.xyz = deltaColorNegative;
        }
      }

    ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    reflectedLight.indirectDiffuse = getAmbientLightIrradiance(ambientLightColor);
    reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert(diffuseColor.rgb);

    reflectedLight.directDiffuse = vLightFront;
    reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert(diffuseColor.rgb);

    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;

    gl_FragColor = vec4(outgoingLight, diffuseColor.a);
}