import { GeometryOptions } from "../preview3DPrintMesh"
import { Font } from "three"
import { CreateFrontTextGeometryStrategyOptions } from "../CreateGeometryStrategies/createTextGeometryStrategy"
import { TextMesh } from "./textMesh"
import { SizeChangeTranslateStrategy } from "../SizeChangeStrategies/sizeChangeTranslateStrategy"

export class FrontTextMesh extends TextMesh {
    constructor(font: Font, geometryOptions: GeometryOptions) {
        let text = geometryOptions.frontText
        if (!text) {
            text = "CodeCharta"
        }
        const createFrontTextGeometryOptions: CreateFrontTextGeometryStrategyOptions = {
            font,
            side: "front",
            text,
            yPosition: -(geometryOptions.width - geometryOptions.mapSideOffset) / 2,
            textSize: geometryOptions.frontTextSize
        }
        super(new SizeChangeTranslateStrategy(), createFrontTextGeometryOptions, true, 1, 0)
        this.name = "Front Text"
    }
}
