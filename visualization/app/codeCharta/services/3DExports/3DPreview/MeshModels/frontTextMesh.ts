import { GeometryOptions } from "../preview3DPrintMesh"
import { Font } from "three"
import { CreateTextGeometryStrategyOptions } from "../CreateGeometryStrategies/createTextGeometryStrategy"
import { TextMesh } from "./textMesh"
import { SizeChangeTranslateStrategy } from "../SizeChangeStrategies/sizeChangeTranslateStrategy"

export class FrontTextMesh extends TextMesh {
    constructor(font: Font, geometryOptions: GeometryOptions) {
        let text = geometryOptions.frontText
        if (!text) {
            text = "FrontText"
        }
        const createFrontTextGeometryOptions: CreateTextGeometryStrategyOptions = {
            font,
            side: "front",
            text,
            xPosition: 0,
            yPosition: -(geometryOptions.width - geometryOptions.mapSideOffset) / 2,
            textSize: geometryOptions.frontTextSize,
            align: "center"
        }
        super(new SizeChangeTranslateStrategy(), createFrontTextGeometryOptions, true, 1, 0)
        this.name = "Front Text"
    }
}
