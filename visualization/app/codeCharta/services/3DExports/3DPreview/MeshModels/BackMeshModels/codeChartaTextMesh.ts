import { Font } from "three"
import { TextMesh } from "../textMesh"
import { CreateTextGeometryStrategyOptions } from "../../CreateGeometryStrategies/createTextGeometryStrategy"
import { BackPrintColorChangeStrategy } from "../../ColorChangeStrategies/backPrintColorChangeStrategy"

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
