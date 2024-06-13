import { GeometryOptions } from "../preview3DPrintMesh"
import { SizeChangeStrategy, SizeChangeStrategyOptions } from "./sizeChangeStrategy"

export interface SizeChangeTranslateStrategyOptions extends SizeChangeStrategyOptions {
    oldWidth: number
    xPosition: "center" | "left" | "right"
}
export class SizeChangeTranslateStrategy implements SizeChangeStrategy {
    async execute({ width }: GeometryOptions, sizeChangeTranslateStrategyOptions: SizeChangeTranslateStrategyOptions): Promise<void> {
        let xChange = 0
        if (sizeChangeTranslateStrategyOptions.xPosition === "left") {
            xChange = -(width - sizeChangeTranslateStrategyOptions.oldWidth) / 2
        } else if (sizeChangeTranslateStrategyOptions.xPosition === "right") {
            xChange = (width - sizeChangeTranslateStrategyOptions.oldWidth) / 2
        }
        sizeChangeTranslateStrategyOptions.mesh.geometry.translate(xChange, -(width - sizeChangeTranslateStrategyOptions.oldWidth) / 2, 0)
    }
}
