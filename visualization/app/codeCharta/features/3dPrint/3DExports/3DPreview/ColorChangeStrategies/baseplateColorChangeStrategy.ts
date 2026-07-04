import { Mesh, ShaderMaterial } from "three"
import { ColorChangeStrategy } from "./colorChangeStrategy"

export class BaseplateColorChangeStrategy implements ColorChangeStrategy {
    execute(numberOfColors: number, mesh: Mesh) {
        const shaderMaterial = mesh.material as ShaderMaterial
        shaderMaterial.defaultAttributeValues.color = numberOfColors === 1 ? [1, 1, 1] : [0.5, 0.5, 0.5]
        return true
    }
}
