import { GeometryOptions } from "../preview3DPrintMesh"
import { GeneralMesh } from "../MeshModels/generalMesh"

export abstract class SizeChangeStrategy {
    abstract execute(geometryOptions: GeometryOptions, oldWidth: number, mesh: GeneralMesh): Promise<void>
}
