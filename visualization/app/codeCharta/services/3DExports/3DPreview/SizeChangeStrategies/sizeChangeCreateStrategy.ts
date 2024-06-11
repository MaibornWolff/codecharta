import { CreateGeometryStrategy } from "../CreateGeometryStrategies/createGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { SizeChangeStrategy, SizeChangeStrategyParameters } from "./sizeChangeStrategy"

export interface SizeChangeCreateStrategyParameters extends SizeChangeStrategyParameters{
    createGeometryStrategy: CreateGeometryStrategy
}
export class SizeChangeCreateStrategy implements SizeChangeStrategy {
    async execute(geometryOptions: GeometryOptions, { createGeometryStrategy, mesh }: SizeChangeCreateStrategyParameters): Promise<void> {
        mesh.boundingBoxCalculated = false
        createGeometryStrategy.create(geometryOptions).then(geometry => {
            mesh.geometry = geometry
        })
        return;
    }
}
