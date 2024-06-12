import { BufferGeometry, Font, TextGeometry } from "three"
import { CreateGeometryStrategy, CreateGeometryStrategyOptions } from "./createGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"

export interface CreateFrontTextGeometryStrategyOptions extends CreateGeometryStrategyOptions {
    font: Font
    text: string
    textSize: number
    side: "front" | "back"
    yPosition: number
    alignIfMultipleLines?: "center" | "left"
}

export class CreateFrontTextGeometryStrategy implements CreateGeometryStrategy {
    async create(
        geometryOptions: GeometryOptions,
        createFrontTextGeometryStrategyOptions: CreateFrontTextGeometryStrategyOptions
    ): Promise<BufferGeometry> {
        const { font, side, text, yPosition, textSize, alignIfMultipleLines } = createFrontTextGeometryStrategyOptions
        if (!text) {
            return new Promise(resolve => {
                resolve(new BufferGeometry())
            })
        }
        const textGeometry =
            alignIfMultipleLines === "center" && text.includes("\n")
                ? this.createMultilineCenteredTextGeometry(text, font, textSize, geometryOptions.printHeight)
                : new TextGeometry(text, {
                      font,
                      size: textSize,
                      height: geometryOptions.printHeight
                  })

        textGeometry.center()
        if (side === "back") {
            textGeometry.rotateY(Math.PI)
        }

        textGeometry.computeBoundingBox()
        const textDepth = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y
        textGeometry.translate(
            0,
            -textDepth / 2 + yPosition,
            side === "front" ? geometryOptions.printHeight / 2 : -geometryOptions.printHeight
        )

        return new Promise(resolve => {
            resolve(textGeometry)
        })
    }

    private createMultilineCenteredTextGeometry(text: string, font: Font, size: number, height: number) {
        const lines = text.split("\n")
        const lineGeometries: BufferGeometry[] = []
        for (const [index, line] of lines.entries()) {
            const lineGeometry = new TextGeometry(line, {
                font,
                size,
                height
            })
            lineGeometry.center()
            lineGeometry.translate(0, -index * size * 1.5, 0)
            lineGeometries.push(lineGeometry)
        }

        return BufferGeometryUtils.mergeBufferGeometries(lineGeometries)
    }
}
