import { GeometryOptions } from "../preview3DPrintMesh"
import { Font } from "three"
import { TextMesh } from "./textMesh"
import { CreateTextGeometryStrategyOptions } from "../CreateGeometryStrategies/createTextGeometryStrategy"
import { SizeChangeTranslateStrategy } from "../SizeChangeStrategies/sizeChangeTranslateStrategy"

export class SecondRowTextMesh extends TextMesh {
    constructor(font: Font, geometryOptions: GeometryOptions) {
        const yOffset = geometryOptions.frontTextSize + geometryOptions.secondRowTextSize / 2
        const createFrontTextGeometryOptions: CreateTextGeometryStrategyOptions = {
            font,
            text: geometryOptions.secondRowText,
            side: "front",
            xPosition: 0,
            yPosition: -(geometryOptions.width - geometryOptions.mapSideOffset) / 2 - yOffset,
            textSize: geometryOptions.secondRowTextSize,
            align: "center"
        }
        super(new SizeChangeTranslateStrategy(), createFrontTextGeometryOptions, false, 1, 0)
        this.name = "SecondRowText"
    }
}
