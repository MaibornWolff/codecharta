import { GeometryOptions } from "../../preview3DPrintMesh"
import { Font } from "three"
import { TextMesh } from "../textMesh"
import { CreateTextGeometryStrategyOptions } from "../../CreateGeometryStrategies/createTextGeometryStrategy"
import { FrontPrintColorChangeStrategy } from "../../ColorChangeStrategies/frontPrintColorChangeStrategy"

export class SecondRowTextMesh extends TextMesh {
    constructor(name: string, font: Font, geometryOptions: GeometryOptions) {
        const createFrontTextGeometryOptions: CreateTextGeometryStrategyOptions = {
            font,
            text: geometryOptions.secondRowText,
            side: "front",
            xPosition: 0,
            yPosition: -geometryOptions.secondRowTextSize,
            textSize: geometryOptions.secondRowTextSize,
            align: "center"
        }
        super(name, new FrontPrintColorChangeStrategy(), 0, false, createFrontTextGeometryOptions)
    }
}
