import { GeometryOptions } from "../preview3DPrintMesh"
import { GeneralMesh } from "../MeshModels/generalMesh"

export interface SizeChangeStrategyOptions {
    mesh: GeneralMesh
}
export interface SizeChangeStrategy {
    execute(geometryOptions: GeometryOptions, sizeChangeStrategyOptions: SizeChangeStrategyOptions): Promise<void>
}
