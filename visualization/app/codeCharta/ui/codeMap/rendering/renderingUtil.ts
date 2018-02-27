import * as THREE from "three"

export class renderingUtil {
    static colorToVec3(color : number) : THREE.Vector3
    {
        return new THREE.Vector3(
            ((color  >> 16) & 0xFF) / 255.0,
            ((color >> 8) & 0xFF) / 255.0,
            (color & 0xFF) / 255.0
        );
    }
}
