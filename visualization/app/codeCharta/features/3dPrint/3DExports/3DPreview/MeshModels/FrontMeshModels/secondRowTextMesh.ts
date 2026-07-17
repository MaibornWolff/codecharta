import { Font } from "three/addons/loaders/FontLoader.js"
import { FrontPrintColorChangeStrategy } from "../../ColorChangeStrategies/frontPrintColorChangeStrategy"
import { CreateTextGeometryStrategyOptions } from "../../CreateGeometryStrategies/createTextGeometryStrategy"
import { GeometryOptions } from "../../geometryOptions"
import { TextMesh } from "../textMesh"

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
