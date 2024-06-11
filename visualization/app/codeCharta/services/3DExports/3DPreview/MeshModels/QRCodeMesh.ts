import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { GeometryOptions } from "../preview3DPrintMesh"
import { CreateQRCodeStrategy } from "../CreateGeometryStrategies/createQRCodeStrategy"
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial"
import { SizeChangeFixPositionStrategy } from "../SizeChangeStrategies/sizeChangeFixPositionStrategy"

export class QRCodeMesh extends ManualVisibilityMesh {
    private readonly createQRCodeStrategy: CreateQRCodeStrategy

    constructor(
    ) {
        super(false, 2, 1)
        const positionFunction = (geometryOptions: GeometryOptions) => geometryOptions.width / 2 - geometryOptions.mapSideOffset
        this.setSizeChangeStrategy(new SizeChangeFixPositionStrategy(positionFunction, positionFunction))
        this.createQRCodeStrategy = new CreateQRCodeStrategy()
        this.name = "QRCode"
    }

    async init(geometryOptions: GeometryOptions): Promise<QRCodeMesh> {
        this.geometry = await this.createQRCodeStrategy.create(geometryOptions)
        this.changeSize(geometryOptions, 0)

        this.material = new MeshBasicMaterial()

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }

    async changeText(geometryOptions: GeometryOptions): Promise<void> {
        this.geometry = await this.createQRCodeStrategy.create(geometryOptions)
    }
}
