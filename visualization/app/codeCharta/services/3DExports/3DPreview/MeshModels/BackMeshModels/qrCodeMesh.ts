import { CustomVisibilityMesh } from "../customVisibilityMesh"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { BackPrintColorChangeStrategy } from "../../ColorChangeStrategies/backPrintColorChangeStrategy"
import { BoxGeometry, BufferGeometry } from "three"
import * as QRCode from "qrcode"
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js"

export class QrCodeMesh extends CustomVisibilityMesh {
    constructor(name: string) {
        super(name, new BackPrintColorChangeStrategy(), 0, false)
    }

    async init(geometryOptions: GeometryOptions): Promise<QrCodeMesh> {
        this.geometry = await this.create(geometryOptions)

        const xPosition = 0.45
        const yPosition = 0.45
        const zPosition = -geometryOptions.baseplateHeight + geometryOptions.printHeight / 2
        this.position.set(xPosition, yPosition, zPosition)

        this.updateColor(geometryOptions.numberOfColors)

        return this
    }

    async changeText(geometryOptions: GeometryOptions): Promise<void> {
        this.geometry = await this.create(geometryOptions)
    }

    async create(geometryOptions: GeometryOptions): Promise<BufferGeometry> {
        if (!geometryOptions.qrCodeText || geometryOptions.qrCodeText.length === 0) {
            return new BufferGeometry()
        }

        const canvas = document.createElement("canvas")
        await QRCode.toCanvas(canvas, geometryOptions.qrCodeText, { errorCorrectionLevel: "H" }) //high error correction works (counter intuitively) way better than low error correction

        const context = canvas.getContext("2d")
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

        const qrCodeGeometries: BufferGeometry[] = []
        const pixelSize = 0.6 / imageData.width
        // Loop over each pixel in the image
        for (let y = 0; y < imageData.height; y += 4) {
            for (let x = 0; x < imageData.width; x += 4) {
                const index = (y * imageData.width + x) * 4
                if (imageData.data[index] !== 0) {
                    const geometry = new BoxGeometry(pixelSize, pixelSize, geometryOptions.printHeight)
                    geometry.translate((-x / 4) * pixelSize, (-y / 4) * pixelSize, 0)
                    qrCodeGeometries.push(geometry)
                }
            }
        }

        this.updateMinWidth(pixelSize)

        return BufferGeometryUtils.mergeGeometries(qrCodeGeometries)
    }

    private updateMinWidth(pixelSize: number) {
        const minWidthOfOneQRCodePixel = 0.6 //mm I tested this value on the prusaXL with 0.4mm nozzle
        this.minWidth = minWidthOfOneQRCodePixel / pixelSize
    }
}
