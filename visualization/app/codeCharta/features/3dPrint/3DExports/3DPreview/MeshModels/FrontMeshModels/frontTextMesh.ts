import { Font } from "three/addons/loaders/FontLoader.js"
import { FrontPrintColorChangeStrategy } from "../../ColorChangeStrategies/frontPrintColorChangeStrategy"
import { CreateTextGeometryStrategyOptions } from "../../CreateGeometryStrategies/createTextGeometryStrategy"
import { GeometryOptions } from "../../geometryOptions"
import { TextMesh } from "../textMesh"

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
            yPosition: geometryOptions.frontTextSize / 2,
            textSize: geometryOptions.frontTextSize,
            align: "center"
        }
        super(name, new FrontPrintColorChangeStrategy(), 0, true, createFrontTextGeometryOptions)
        this.name = "Front Text"
    }
}
