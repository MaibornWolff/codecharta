import { BufferGeometry, Font, TextGeometry } from "three"
import { CreateGeometryStrategy, CreateGeometryStrategyOptions } from "./createGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"

export interface CreateFrontTextGeometryStrategyOptions extends CreateGeometryStrategyOptions {
    font: Font
    text: string
    yOffset: number
    textSize: number
}

export class CreateFrontTextGeometryStrategy implements CreateGeometryStrategy {
    async create(
        geometryOptions: GeometryOptions,
        createFrontTextGeometryStrategyOptions: CreateFrontTextGeometryStrategyOptions
    ): Promise<BufferGeometry> {
        const { font, text, yOffset, textSize } = createFrontTextGeometryStrategyOptions
        if (!text) {
            return new Promise(resolve => {
                resolve(new BufferGeometry())
            })
        }
        const textGeometry = new TextGeometry(text, {
            font,
            size: textSize,
            height: geometryOptions.frontPrintDepth
        })
        textGeometry.center()

        //calculate the bounding box of the text
        textGeometry.computeBoundingBox()
        const textDepth = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y
        textGeometry.translate(
            0,
            -textDepth / 2 - (geometryOptions.width - geometryOptions.mapSideOffset) / 2 - yOffset,
            geometryOptions.frontPrintDepth / 2
        )

        return new Promise(resolve => {
            resolve(textGeometry)
        })
    }
}
