import { GeometryOptions } from "../preview3DPrintMesh"
import { SizeChangeStrategy } from "./sizeChangeStrategy"
import { GeneralMesh } from "../MeshModels/generalMesh"

export class SizeChangeTranslateStrategy implements SizeChangeStrategy {
    async execute({ width }: GeometryOptions, oldWidth: number, mesh : GeneralMesh): Promise<void> {
        mesh.geometry.translate(0, -(width - oldWidth) / 2, 0)
    }
}
