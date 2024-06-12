import { GeometryOptions } from "../preview3DPrintMesh"
import { SizeChangeStrategy, SizeChangeStrategyOptions } from "./sizeChangeStrategy"

export interface SizeChangeTranslateStrategyOptions extends SizeChangeStrategyOptions {
    oldWidth: number
}
export class SizeChangeTranslateStrategy implements SizeChangeStrategy {
    async execute({ width }: GeometryOptions, sizeChangeTranslateStrategyOptions: SizeChangeTranslateStrategyOptions): Promise<void> {
        sizeChangeTranslateStrategyOptions.mesh.geometry.translate(0, -(width - sizeChangeTranslateStrategyOptions.oldWidth) / 2, 0)
    }
}
