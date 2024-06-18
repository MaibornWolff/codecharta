import { Font } from "three"
import { CreateTextGeometryStrategyOptions } from "../CreateGeometryStrategies/createTextGeometryStrategy"
import { TextMesh } from "./textMesh"

export class BackBelowLogoTextMesh extends TextMesh {
    constructor(name: string, font: Font) {
        const createFrontTextGeometryOptions: CreateTextGeometryStrategyOptions = {
            font,
            text: "IT Stabilization & Modernization\nmaibornwolff.de/service/it-sanierung",
            side: "back",
            xPosition: 0,
            yPosition: 0.23,
            align: "center"
        }
        super(name, createFrontTextGeometryOptions, true, 2, 0.7)
    }
}
