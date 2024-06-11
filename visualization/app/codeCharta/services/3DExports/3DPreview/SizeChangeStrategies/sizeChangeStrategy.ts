import { GeometryOptions } from "../preview3DPrintMesh"
import { GeneralMesh } from "../MeshModels/generalMesh"

export interface SizeChangeStrategyParameters {
    oldWidth: number
    mesh: GeneralMesh
}
export abstract class SizeChangeStrategy {
    abstract execute(geometryOptions: GeometryOptions, sizeChangeStrategyParameters: SizeChangeStrategyParameters): Promise<void>
}
