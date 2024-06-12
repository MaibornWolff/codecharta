import { ShaderMaterial } from "three"
import { ColorChangeStrategy } from "./colorChangeStrategy"
import { BaseplateMesh } from "../MeshModels/baseplateMesh"

export class BaseplateColorChangeStrategy implements ColorChangeStrategy {
    execute(numberOfColors: number, mesh: BaseplateMesh){
        const shaderMaterial = mesh.material as ShaderMaterial
        shaderMaterial.defaultAttributeValues.color = numberOfColors === 1 ? [1, 1, 1] : [0.5, 0.5, 0.5]
    }
}
