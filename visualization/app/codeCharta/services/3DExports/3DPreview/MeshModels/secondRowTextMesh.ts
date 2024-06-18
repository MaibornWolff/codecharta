import { GeometryOptions } from "../preview3DPrintMesh"
import { Font } from "three"
import { TextMesh } from "./textMesh"
import { CreateTextGeometryStrategyOptions } from "../CreateGeometryStrategies/createTextGeometryStrategy"

export class SecondRowTextMesh extends TextMesh {
    constructor(name: string, font: Font, geometryOptions: GeometryOptions) {
        const createFrontTextGeometryOptions: CreateTextGeometryStrategyOptions = {
            font,
            text: geometryOptions.secondRowText,
            side: "front",
            xPosition: 0,
            yPosition:
                -(geometryOptions.width - geometryOptions.mapSideOffset) / 2 -
                geometryOptions.frontTextSize -
                geometryOptions.secondRowTextSize,
            textSize: geometryOptions.secondRowTextSize,
            align: "center"
        }
        super(name, createFrontTextGeometryOptions, false, 1, 0)
    }
}
