import { GeometryOptions } from "../preview3DPrintMesh"
import { Font } from "three"
import { SizeChangeScaleStrategy } from "../SizeChangeStrategies/sizeChangeScaleStrategy"
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
        super(name, new SizeChangeScaleStrategy(), createFrontTextGeometryOptions, true, 2, 0.7)
        this.name = "CodeChartaText"
    }

    async init(geometryOptions: GeometryOptions): Promise<CodeChartaTextMesh> {
        await super.init(geometryOptions)

        const oldWidth = (200 * geometryOptions.width) / (geometryOptions.width - geometryOptions.mapSideOffset * 2)
        this.changeSize(geometryOptions, oldWidth)

        return this
    }
}
