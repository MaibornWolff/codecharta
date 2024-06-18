import { BufferGeometry, Font, TextGeometry } from "three"
import { CreateGeometryStrategy, CreateGeometryStrategyOptions } from "./createGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"

export interface CreateTextGeometryStrategyOptions extends CreateGeometryStrategyOptions {
    font: Font
    text: string
    textSize: number
    side: "front" | "back"
    xPosition: number
    yPosition: number
    align: "center" | "left"
}

export class CreateTextGeometryStrategy implements CreateGeometryStrategy {
    async create(
        geometryOptions: GeometryOptions,
        createTextGeometryStrategyOptions: CreateTextGeometryStrategyOptions
    ): Promise<BufferGeometry> {
        const { font, side, text, xPosition, yPosition, textSize, align } = createTextGeometryStrategyOptions
        if (!text) {
            return new BufferGeometry()
        }
        const textGeometry =
            align === "center" && text.includes("\n")
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
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x
        const xPositionOffset = align === "center" ? 0 : textWidth / 2
        const xPositionDirection = side === "front" ? 1 : -1
        textGeometry.translate(
            xPositionDirection * (xPositionOffset + xPosition),
            yPosition,
            side === "front" ? geometryOptions.printHeight / 2 : -geometryOptions.printHeight - 0.1
        )

        return textGeometry
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
