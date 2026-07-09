import { Font } from "three/addons/loaders/FontLoader.js"
import { BackPrintColorChangeStrategy } from "../../ColorChangeStrategies/backPrintColorChangeStrategy"
import { CreateTextGeometryStrategyOptions } from "../../CreateGeometryStrategies/createTextGeometryStrategy"
import { TextMesh } from "../textMesh"

export class CodeChartaTextMesh extends TextMesh {
    constructor(name: string, font: Font) {
        const createFrontTextGeometryOptions: CreateTextGeometryStrategyOptions = {
            font,
            text: "github.com/MaibornWolff/codecharta",
            side: "back",
            xPosition: 0,
            yPosition: 0,
            align: "center"
        }
        super(name, new BackPrintColorChangeStrategy(), 200, true, createFrontTextGeometryOptions)
    }
}
