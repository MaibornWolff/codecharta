import { GeometryOptions } from "../preview3DPrintMesh"
import { SizeChangeStrategy } from "./sizeChangeStrategy"
import { GeneralMesh } from "../MeshModels/generalMesh"

export class SizeChangeScaleStrategy implements SizeChangeStrategy {
    async execute({ width }: GeometryOptions, oldWidth: number, mesh: GeneralMesh): Promise<void> {
        const scaleFactor = width / oldWidth
        mesh.scale.set(mesh.scale.x * scaleFactor, mesh.scale.y * scaleFactor, mesh.scale.z)
    }
}
