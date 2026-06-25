varying highp float vDelta;
varying vec2 vUV;
varying vec4 vOutgoingDiffuseColor;
varying vec4 vOutgoingDiffuseDeltaColor;
varying vec3 vWorldNormal;

bool normalPointingUp(const in vec3 normal)
{
    return normal.y > 0.9;
}

void main() {
    const float minDelta = 0.001;
    bool isTop = normalPointingUp(vWorldNormal);
    
    if (abs(vDelta) > minDelta && (vUV.y > 1.0 - abs(vDelta) || isTop))
    {
        gl_FragColor = vOutgoingDiffuseDeltaColor;
    } else {
        gl_FragColor = vOutgoingDiffuseColor;
    }
}
