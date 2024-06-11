import { GeometryOptions } from "../preview3DPrintMesh"
import { GeneralMesh } from "../generalMesh"

export interface SizeChangeStrategyParameters {
    mesh: GeneralMesh
}
export abstract class SizeChangeStrategy {
    abstract execute(geometryOptions: GeometryOptions, sizeChangeStrategyParameters: SizeChangeStrategyParameters): Promise<void>
}
