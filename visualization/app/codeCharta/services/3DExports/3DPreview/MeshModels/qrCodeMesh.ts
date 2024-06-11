import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { GeometryOptions } from "../preview3DPrintMesh"
import { CreateQRCodeStrategy } from "../CreateGeometryStrategies/createQRCodeStrategy"

export class QrCodeMesh extends ManualVisibilityMesh {
    private readonly createQRCodeStrategy: CreateQRCodeStrategy

    constructor(
    ) {
        super(false, 2, 0.1)
        this.createQRCodeStrategy = new CreateQRCodeStrategy()
        this.name = "QrCode"
    }

    async init(geometryOptions: GeometryOptions): Promise<QrCodeMesh> {
        this.geometry = await this.createQRCodeStrategy.create(geometryOptions)

        this.position.x = geometryOptions.width / 2 - geometryOptions.mapSideOffset
        this.position.y = geometryOptions.width / 2 - geometryOptions.mapSideOffset

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }

    async changeText(geometryOptions: GeometryOptions): Promise<void> {
        this.geometry = await this.createQRCodeStrategy.create(geometryOptions)
    }
}
