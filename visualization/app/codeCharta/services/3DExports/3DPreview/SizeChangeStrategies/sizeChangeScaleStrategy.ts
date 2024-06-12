import { GeometryOptions } from "../preview3DPrintMesh"
import { SizeChangeStrategy, SizeChangeStrategyOptions } from "./sizeChangeStrategy"

export interface SizeChangeScaleStrategyOptions extends SizeChangeStrategyOptions {
    oldWidth: number
}
export class SizeChangeScaleStrategy implements SizeChangeStrategy {
    async execute({ width }: GeometryOptions, sizeChangeScaleStrategyOptions: SizeChangeScaleStrategyOptions): Promise<void> {
        const { mesh, oldWidth } = sizeChangeScaleStrategyOptions
        const scaleFactor = width / oldWidth
        mesh.scale.set(mesh.scale.x * scaleFactor, mesh.scale.y * scaleFactor, mesh.scale.z)
    }
}
