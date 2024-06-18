import { GeometryOptions } from "../preview3DPrintMesh"
import { Font } from "three"
import { SizeChangeScaleStrategy } from "../SizeChangeStrategies/sizeChangeScaleStrategy"
import { CreateTextGeometryStrategyOptions } from "../CreateGeometryStrategies/createTextGeometryStrategy"
import { TextMesh } from "./textMesh"

export class BackBelowLogoTextMesh extends TextMesh {
    constructor(name: string, font: Font, geometryOptions: GeometryOptions) {
        const createFrontTextGeometryOptions: CreateTextGeometryStrategyOptions = {
            font,
            text: "IT Stabilization & Modernization\nmaibornwolff.de/service/it-sanierung",
            side: "back",
            xPosition: 0,
            yPosition: 50, //TODO: make relative
            textSize: geometryOptions.backTextSize,
            align: "center"
        }
        super(name, new SizeChangeScaleStrategy(), createFrontTextGeometryOptions, true, 2, 0.7)
        this.name = "BackBelowLogoText"
    }

    async init(geometryOptions: GeometryOptions): Promise<BackBelowLogoTextMesh> {
        await super.init(geometryOptions)

        const oldWidth = (200 * geometryOptions.width) / (geometryOptions.width - geometryOptions.mapSideOffset * 2)
        this.changeSize(geometryOptions, oldWidth)

        return this
    }
}
