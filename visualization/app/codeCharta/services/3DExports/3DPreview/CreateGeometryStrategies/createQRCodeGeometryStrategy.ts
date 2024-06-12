import { BoxGeometry, BufferGeometry } from "three"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"
import { CreateGeometryStrategy } from "./createGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import * as QRCode from "qrcode"

export class CreateQRCodeGeometryStrategy implements CreateGeometryStrategy {
    async create(geometryOptions: GeometryOptions): Promise<BufferGeometry> {
        if (!geometryOptions.qrCodeText || geometryOptions.qrCodeText.length === 0) {
            return new BufferGeometry()
        }

        const canvas = document.createElement("canvas")
        await QRCode.toCanvas(canvas, geometryOptions.qrCodeText, { errorCorrectionLevel: "M" })

        const context = canvas.getContext("2d")
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        const qrCodeGeometries: BufferGeometry[] = []
        const pixelSize = 50 / imageData.width

        // Loop over each pixel in the image
        for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < imageData.width; x++) {
                const index = (y * imageData.width + x) * 4
                if (data[index] !== 0) {
                    const geometry = new BoxGeometry(pixelSize, pixelSize, geometryOptions.baseplateHeight / 2)
                    geometry.translate(-x * pixelSize, -y * pixelSize, (-geometryOptions.baseplateHeight * 3) / 4)
                    qrCodeGeometries.push(geometry)
                }
            }
        }

        return BufferGeometryUtils.mergeBufferGeometries(qrCodeGeometries)
    }
}
