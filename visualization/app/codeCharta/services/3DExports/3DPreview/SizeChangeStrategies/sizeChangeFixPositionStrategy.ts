import { GeometryOptions } from "../preview3DPrintMesh"
import { SizeChangeStrategy, SizeChangeStrategyOptions } from "./sizeChangeStrategy"

export interface SizeChangeFixPositionStrategyOptions extends SizeChangeStrategyOptions {
    xPositionFunction: (geometryOptions: GeometryOptions) => number
    yPositionFunction: (geometryOptions: GeometryOptions) => number
}
export class SizeChangeFixPositionStrategy implements SizeChangeStrategy {
    async execute(
        geometryOptions: GeometryOptions,
        sizeChangeFixPositionStrategyOptions: SizeChangeFixPositionStrategyOptions
    ): Promise<void> {
        const { mesh, xPositionFunction, yPositionFunction } = sizeChangeFixPositionStrategyOptions
        mesh.position.x = xPositionFunction(geometryOptions)
        mesh.position.y = yPositionFunction(geometryOptions)
    }
}
