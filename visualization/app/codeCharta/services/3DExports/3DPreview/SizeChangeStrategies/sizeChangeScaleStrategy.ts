import { GeometryOptions } from "../preview3DPrintMesh"
import { SizeChangeStrategy, SizeChangeStrategyParameters } from "./sizeChangeStrategy"

export interface SizeChangeScaleStrategyParameters extends SizeChangeStrategyParameters {
    currentWidth: number
}
export class SizeChangeScaleStrategy implements SizeChangeStrategy {
    async execute({ width }: GeometryOptions, { currentWidth, mesh }: SizeChangeScaleStrategyParameters): Promise<void> {
        const scaleFactor = width / currentWidth
        mesh.scale.set(mesh.scale.x * scaleFactor, mesh.scale.y * scaleFactor, mesh.scale.z)
    }
}
