import { BufferGeometry, Font, TextGeometry } from "three"
import { CreateGeometryStrategy } from "./createGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"

export class CreateFrontTextGeometryStrategy extends CreateGeometryStrategy {
    constructor(private font: Font, private text: string, private yOffset: number, private textSize: number){
        super()
    }

    create(geometryOptions: GeometryOptions): Promise<BufferGeometry> {
        if (!this.text) {
            this.text = ""
        }
        const textGeometry = new TextGeometry(this.text, {
            font: this.font,
            size: this.textSize,
            height: geometryOptions.frontPrintDepth
        })
        textGeometry.center()

        //calculate the bounding box of the text
        textGeometry.computeBoundingBox()
        const textDepth = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y
        textGeometry.translate(
            0,
            -textDepth / 2 - (geometryOptions.width - geometryOptions.mapSideOffset) / 2 - this.yOffset,
            geometryOptions.frontPrintDepth / 2
        )

        return new Promise(resolve => {
            resolve(textGeometry)
        })
    }
}
