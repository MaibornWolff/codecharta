varying vec3 vColor;
varying vec3 viewDirection;
varying vec3 worldNormal;
varying vec3 vLightFront;
varying highp float oSubGeomIdx;

uniform vec3 emissive;
uniform vec3 ambientLightColor;

uniform vec3 highlightColor;
uniform highp float highlightColorIdx;

uniform vec3 selectedColor;
uniform highp float selectedColorIdx;

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

void main() {
    vec4 diffuseColor = vec4(vColor, 1.0);

    float epsilon = 0.0001;

    if (abs(oSubGeomIdx - selectedColorIdx) < epsilon)
    {
        diffuseColor.xyz = selectedColor;
    }

    ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    vec3 totalEmissiveRadiance = emissive;

    if (abs(oSubGeomIdx - highlightColorIdx) < epsilon)
    {
        totalEmissiveRadiance = highlightColor;
    }

    reflectedLight.indirectDiffuse = getAmbientLightIrradiance(ambientLightColor);
    reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert(diffuseColor.rgb);

    reflectedLight.directDiffuse = vLightFront;
    reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert(diffuseColor.rgb);

    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;

    gl_FragColor = vec4(outgoingLight, diffuseColor.a);
}