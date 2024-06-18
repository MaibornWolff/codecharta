import { GeometryOptions } from "../preview3DPrintMesh"
import { Font } from "three"
import { TextMesh } from "./textMesh"
import { CreateTextGeometryStrategyOptions } from "../CreateGeometryStrategies/createTextGeometryStrategy"

export class CodeChartaTextMesh extends TextMesh {
    constructor(name: string, font: Font, geometryOptions: GeometryOptions) {
        const createFrontTextGeometryOptions: CreateTextGeometryStrategyOptions = {
            font,
            text: "github.com/MaibornWolff/codecharta",
            side: "back",
            xPosition: 0,
            yPosition: 0, //TODO: make relative
            textSize: geometryOptions.backTextSize,
            align: "center"
        }
        super(name, createFrontTextGeometryOptions, true, 2, 0.7)
        this.name = "CodeChartaText"
    }
}
