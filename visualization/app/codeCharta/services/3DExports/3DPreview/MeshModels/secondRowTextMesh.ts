import { GeometryOptions } from "../preview3DPrintMesh"
import { Font } from "three"
import { TextMesh } from "./textMesh"
import { CreateFrontTextGeometryStrategyOptions } from "../CreateGeometryStrategies/createTextGeometryStrategy"
import { SizeChangeTranslateStrategy } from "../SizeChangeStrategies/sizeChangeTranslateStrategy"

export class SecondRowTextMesh extends TextMesh {
    constructor(font: Font, geometryOptions: GeometryOptions) {
        const yOffset = geometryOptions.frontTextSize + geometryOptions.secondRowTextSize / 2
        const createFrontTextGeometryOptions: CreateFrontTextGeometryStrategyOptions = {
            font,
            text: geometryOptions.secondRowText,
            side: "front",
            yPosition: -(geometryOptions.width - geometryOptions.mapSideOffset) / 2 - yOffset,
            textSize: geometryOptions.secondRowTextSize
        }
        super(new SizeChangeTranslateStrategy(), createFrontTextGeometryOptions, false, 1, 0)
        this.name = "Second Row Text"
    }
}
