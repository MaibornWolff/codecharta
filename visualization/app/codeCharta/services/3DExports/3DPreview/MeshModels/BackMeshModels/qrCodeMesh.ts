import { CustomVisibilityMesh } from "../customVisibilityMesh"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { CreateQRCodeGeometryStrategy } from "../../CreateGeometryStrategies/createQRCodeGeometryStrategy"
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial"
import { BackPrintColorChangeStrategy } from "../../ColorChangeStrategies/backPrintColorChangeStrategy"

export class QrCodeMesh extends CustomVisibilityMesh {
    private readonly createQRCodeStrategy: CreateQRCodeGeometryStrategy

    constructor(name: string) {
        super(name, new BackPrintColorChangeStrategy(), 1, false)
        this.createQRCodeStrategy = new CreateQRCodeGeometryStrategy()
    }

    async init(geometryOptions: GeometryOptions): Promise<QrCodeMesh> {
        this.geometry = await this.createQRCodeStrategy.create(geometryOptions)
        this.changeSize(geometryOptions)

        this.material = new MeshBasicMaterial()

        this.updateColor(geometryOptions.numberOfColors)

        return this
    }

    async changeSize(geometryOptions: GeometryOptions): Promise<void> {
        const positionFunction = (geometryOptions: GeometryOptions) => geometryOptions.width / 2 - geometryOptions.mapSideOffset
        this.position.x = positionFunction(geometryOptions)
        this.position.y = positionFunction(geometryOptions)
        super.updateVisibility()
    }

    async changeText(geometryOptions: GeometryOptions): Promise<void> {
        this.geometry = await this.createQRCodeStrategy.create(geometryOptions)
    }
}
