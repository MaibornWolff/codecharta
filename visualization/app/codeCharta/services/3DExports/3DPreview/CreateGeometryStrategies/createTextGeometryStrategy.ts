import { BufferGeometry } from "three"
import { TextGeometry } from "three/addons/geometries/TextGeometry.js"
import { Font } from "three/addons/loaders/FontLoader.js"
import { CreateGeometryStrategy, CreateGeometryStrategyOptions } from "./createGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js"

export interface CreateTextGeometryStrategyOptions extends CreateGeometryStrategyOptions {
    font: Font
    text: string
    side: "front" | "back"
    xPosition: number
    yPosition: number
    align: "center" | "left"
    textSize?: number
}

export class CreateTextGeometryStrategy implements CreateGeometryStrategy {
    async create(
        geometryOptions: GeometryOptions,
        createTextGeometryStrategyOptions: CreateTextGeometryStrategyOptions
    ): Promise<BufferGeometry> {
        const { font, side, text, xPosition, yPosition, align } = createTextGeometryStrategyOptions
        if (!text) {
            return new BufferGeometry()
        }
        let { textSize } = createTextGeometryStrategyOptions
        if (!textSize) {
            textSize = 0.025
        }
        const textGeometry =
            align === "center" && text.includes("\n")
                ? this.createMultilineCenteredTextGeometry(text, font, textSize, geometryOptions.printHeight)
                : new TextGeometry(text, {
                      font,
                      size: textSize,
                      depth: geometryOptions.printHeight
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
            side === "front" ? geometryOptions.printHeight / 2 : -geometryOptions.baseplateHeight + geometryOptions.printHeight / 2
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

        return BufferGeometryUtils.mergeGeometries(lineGeometries)
    }
}
