import { CustomVisibilityMesh } from "../customVisibilityMesh"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { CreateQRCodeGeometryStrategy } from "../../CreateGeometryStrategies/createQRCodeGeometryStrategy"
import { BackPrintColorChangeStrategy } from "../../ColorChangeStrategies/backPrintColorChangeStrategy"

export class QrCodeMesh extends CustomVisibilityMesh {
    //TODO: make this implement GeneralSizeChangeMesh and update the errorCorrectionLevel - for this some 3D printing tests need to be made before
    private readonly createQRCodeStrategy: CreateQRCodeGeometryStrategy

    constructor(name: string) {
        super(name, new BackPrintColorChangeStrategy(), 280, false)
        this.createQRCodeStrategy = new CreateQRCodeGeometryStrategy()
    }

    async init(geometryOptions: GeometryOptions): Promise<QrCodeMesh> {
        this.geometry = await this.createQRCodeStrategy.create(geometryOptions)

        const xPosition = 0.45
        const yPosition = 0.45
        const zPosition = -geometryOptions.baseplateHeight + geometryOptions.printHeight / 2
        this.position.set(xPosition, yPosition, zPosition)

        this.updateColor(geometryOptions.numberOfColors)

        return this
    }

    async changeText(geometryOptions: GeometryOptions): Promise<void> {
        this.geometry = await this.createQRCodeStrategy.create(geometryOptions)
    }
}
