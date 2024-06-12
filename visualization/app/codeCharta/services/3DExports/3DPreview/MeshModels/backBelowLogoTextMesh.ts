import { GeometryOptions } from "../preview3DPrintMesh"
import { Font } from "three"
import { SizeChangeScaleStrategy } from "../SizeChangeStrategies/sizeChangeScaleStrategy"
import { CreateFrontTextGeometryStrategyOptions } from "../CreateGeometryStrategies/createTextGeometryStrategy"
import { TextMesh } from "./textMesh"

export class BackBelowLogoTextMesh extends TextMesh {
    constructor(font: Font, geometryOptions: GeometryOptions) {
        const createFrontTextGeometryOptions: CreateFrontTextGeometryStrategyOptions = {
            font,
            text: "IT Stabilization & Modernization\nmaibornwolff.de/service/it-sanierung",
            side: "back",
            yPosition: 60, //TODO: make relative
            textSize: geometryOptions.backTextSize,
            alignIfMultipleLines: "center"
        }
        super(new SizeChangeScaleStrategy(), createFrontTextGeometryOptions, true, 2, 0.7)
        this.name = "Back MW Logo"
    }

    async init(geometryOptions: GeometryOptions): Promise<BackBelowLogoTextMesh> {
        await super.init(geometryOptions)

        const oldWidth = (200 * geometryOptions.width) / (geometryOptions.width - geometryOptions.mapSideOffset * 2)
        this.changeSize(geometryOptions, oldWidth)

        return this
    }
}
