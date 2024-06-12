import { CreateGeometryStrategy } from "../CreateGeometryStrategies/createGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { SizeChangeStrategy, SizeChangeStrategyOptions } from "./sizeChangeStrategy"

export interface SizeChangeCreateStrategyOptions extends SizeChangeStrategyOptions {
    createGeometryStrategy: CreateGeometryStrategy
}
export class SizeChangeCreateStrategy implements SizeChangeStrategy {
    async execute(geometryOptions: GeometryOptions, sizeChangeCreateStrategyOptions: SizeChangeCreateStrategyOptions): Promise<void> {
        sizeChangeCreateStrategyOptions.mesh.boundingBoxCalculated = false
        sizeChangeCreateStrategyOptions.createGeometryStrategy.create(geometryOptions).then(geometry => {
            sizeChangeCreateStrategyOptions.mesh.geometry = geometry
        })
        return
    }
}
