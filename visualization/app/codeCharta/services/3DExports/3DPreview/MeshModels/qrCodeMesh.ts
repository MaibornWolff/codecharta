import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { GeometryOptions } from "../preview3DPrintMesh"
import { CreateQRCodeGeometryStrategy } from "../CreateGeometryStrategies/createQRCodeGeometryStrategy"
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial"
import { SizeChangeFixPositionStrategy, SizeChangeFixPositionStrategyOptions } from "../SizeChangeStrategies/sizeChangeFixPositionStrategy"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"

export class QrCodeMesh extends ManualVisibilityMesh {
    private readonly createQRCodeStrategy: CreateQRCodeGeometryStrategy
    private readonly positionFunction: (geometryOptions: GeometryOptions) => number

    constructor(name: string) {
        super(name, new SizeChangeFixPositionStrategy(), new DefaultPrintColorChangeStrategy(), 1, false, 2)
        this.createQRCodeStrategy = new CreateQRCodeGeometryStrategy()
        this.positionFunction = (geometryOptions: GeometryOptions) => geometryOptions.width / 2 - geometryOptions.mapSideOffset
    }

    async init(geometryOptions: GeometryOptions): Promise<QrCodeMesh> {
        this.geometry = await this.createQRCodeStrategy.create(geometryOptions)
        this.changeSize(geometryOptions)

        this.material = new MeshBasicMaterial()

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }

    async changeSize(geometryOptions: GeometryOptions): Promise<void> {
        await this.sizeChangeStrategy.execute(geometryOptions, {
            mesh: this,
            xPositionFunction: this.positionFunction,
            yPositionFunction: this.positionFunction
        } as SizeChangeFixPositionStrategyOptions)
        super.updateVisibility()
    }

    async changeText(geometryOptions: GeometryOptions): Promise<void> {
        this.geometry = await this.createQRCodeStrategy.create(geometryOptions)
    }
}
