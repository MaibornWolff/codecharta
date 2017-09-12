varying vec3 oColor;
varying vec3 viewDirection;
varying vec3 worldNormal;
varying highp float oSubGeomIdx;

struct DirectionalLight {
  vec3 direction;
  vec3 color;
};

uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

uniform vec3 highlightColor;
uniform highp float highlightColorIdx;

void main()
{
    vec3 lightDirection = normalize(vec3(-1, -1, -1));
    vec3 resultColor = vec3(oColor);

    for (int i=0; i < NUM_DIR_LIGHTS; ++i)
    {
        float amount = max(dot(directionalLights[i].direction, worldNormal), 0.0);
        resultColor += directionalLights[i].color * amount;
    }

    float epsilon = 0.0001;

    if (abs(oSubGeomIdx - highlightColorIdx) < epsilon)
    {
        resultColor = vec3(1, 0, 0);
    }

    gl_FragColor = vec4(resultColor, 1);
}