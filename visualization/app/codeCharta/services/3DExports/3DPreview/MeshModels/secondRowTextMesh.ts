import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { GeometryOptions } from "../preview3DPrintMesh"
import { Font, MeshBasicMaterial } from "three"
import { CreateFrontTextGeometryStrategy } from "../CreateGeometryStrategies/createFrontTextGeometryStrategy"
import { SizeChangeTranslateStrategy } from "../SizeChangeStrategies/sizeChangeTranslateStrategy"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"

export class SecondRowTextMesh extends ManualVisibilityMesh {
    private readonly createFrontTextGeometryStrategy: CreateFrontTextGeometryStrategy

    constructor(public font: Font, geometryOptions: GeometryOptions) {
        super(new DefaultPrintColorChangeStrategy(), false, 1, 0.1)
        const yOffset = geometryOptions.frontTextSize + geometryOptions.secondRowTextSize / 2
        this.createFrontTextGeometryStrategy = new CreateFrontTextGeometryStrategy(font, geometryOptions.secondRowText, yOffset, geometryOptions.secondRowTextSize)
        this.name = "Second Row Text"
        this.setSizeChangeStrategy(new SizeChangeTranslateStrategy())

    }

    async init(geometryOptions: GeometryOptions): Promise<SecondRowTextMesh> {
        this.geometry = await this.createFrontTextGeometryStrategy.create(geometryOptions)

        this.material = new MeshBasicMaterial()

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }
}
