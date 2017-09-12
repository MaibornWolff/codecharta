attribute vec3 color;
attribute highp float subGeomIdx;

varying vec3 oColor;
varying vec3 viewDirection;
varying vec3 worldNormal;
varying highp float oSubGeomIdx;

void main() 
{
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * worldPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    viewDirection = normalize(worldPosition.xyz - cameraPosition);

	vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * modelViewPosition;
    oColor = color;

    worldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    oSubGeomIdx = float(subGeomIdx);
}