import { GeometryOptions } from "../preview3DPrintMesh"
import { Font } from "three"
import { CreateTextGeometryStrategyOptions } from "../CreateGeometryStrategies/createTextGeometryStrategy"
import { TextMesh } from "./textMesh"
import { FrontPrintColorChangeStrategy } from "../ColorChangeStrategies/frontPrintColorChangeStrategy"

export class FrontTextMesh extends TextMesh {
    constructor(name: string, font: Font, geometryOptions: GeometryOptions) {
        let text = geometryOptions.frontText
        if (!text) {
            text = "FrontText"
        }
        const createFrontTextGeometryOptions: CreateTextGeometryStrategyOptions = {
            font,
            side: "front",
            text,
            xPosition: 0,
            yPosition: -(geometryOptions.width - geometryOptions.mapSideOffset) / 2 - geometryOptions.frontTextSize / 2,
            textSize: geometryOptions.frontTextSize,
            align: "center"
        }
        super(name, new FrontPrintColorChangeStrategy(), 0, true, createFrontTextGeometryOptions)
        this.name = "Front Text"
    }
}
