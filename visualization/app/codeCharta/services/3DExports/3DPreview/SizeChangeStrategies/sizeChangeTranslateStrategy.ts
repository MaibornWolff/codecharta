import { GeometryOptions } from "../preview3DPrintMesh"
import { SizeChangeStrategy, SizeChangeStrategyParameters } from "./sizeChangeStrategy"

export class SizeChangeTranslateStrategy implements SizeChangeStrategy {
    async execute({ width }: GeometryOptions, { oldWidth, mesh }: SizeChangeStrategyParameters): Promise<void> {
        mesh.geometry.translate(0, -(width - oldWidth) / 2, 0)
    }
}
