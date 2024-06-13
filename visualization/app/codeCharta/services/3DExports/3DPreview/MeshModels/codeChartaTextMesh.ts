import { GeometryOptions } from "../preview3DPrintMesh"
import { Font } from "three"
import { SizeChangeScaleStrategy } from "../SizeChangeStrategies/sizeChangeScaleStrategy"
import { TextMesh } from "./textMesh"
import { CreateFrontTextGeometryStrategyOptions } from "../CreateGeometryStrategies/createTextGeometryStrategy"

export class CodeChartaTextMesh extends TextMesh {
    constructor(font: Font, geometryOptions: GeometryOptions) {
        const createFrontTextGeometryOptions: CreateFrontTextGeometryStrategyOptions = {
            font,
            text: "github.com/MaibornWolff/codecharta",
            side: "back",
            yPosition: 5, //TODO: make relative
            textSize: geometryOptions.backTextSize
        }
        super(new SizeChangeScaleStrategy(), createFrontTextGeometryOptions, true, 2, 0.7)
        this.name = "CodeChartaText"
    }

    async init(geometryOptions: GeometryOptions): Promise<CodeChartaTextMesh> {
        await super.init(geometryOptions)

        const oldWidth = (200 * geometryOptions.width) / (geometryOptions.width - geometryOptions.mapSideOffset * 2)
        this.changeSize(geometryOptions, oldWidth)

        return this
    }
}
