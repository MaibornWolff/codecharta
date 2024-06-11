import { GeometryOptions } from "../preview3DPrintMesh"
import { SizeChangeStrategy, SizeChangeStrategyParameters } from "./sizeChangeStrategy"

export class SizeChangeScaleStrategy implements SizeChangeStrategy {
    async execute({ width }: GeometryOptions, { oldWidth, mesh }: SizeChangeStrategyParameters): Promise<void> {
        const scaleFactor = width / oldWidth
        console.log("scaleFactor", scaleFactor, mesh, oldWidth, width)
        mesh.scale.set(mesh.scale.x * scaleFactor, mesh.scale.y * scaleFactor, mesh.scale.z)
    }
}
