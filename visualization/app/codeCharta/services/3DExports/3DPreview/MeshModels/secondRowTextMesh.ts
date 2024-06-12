import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { GeometryOptions } from "../preview3DPrintMesh"
import { Font, MeshBasicMaterial } from "three"
import {
    CreateFrontTextGeometryStrategy,
    CreateFrontTextGeometryStrategyOptions
} from "../CreateGeometryStrategies/createFrontTextGeometryStrategy"
import { SizeChangeTranslateStrategy } from "../SizeChangeStrategies/sizeChangeTranslateStrategy"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"

export class SecondRowTextMesh extends ManualVisibilityMesh {
    private readonly createFrontTextGeometryStrategy: CreateFrontTextGeometryStrategy
    private readonly createFrontTextGeometryOptions: CreateFrontTextGeometryStrategyOptions

    constructor(
        public font: Font,
        geometryOptions: GeometryOptions
    ) {
        super(new SizeChangeTranslateStrategy(), new DefaultPrintColorChangeStrategy(), false, 1, 0.1)
        const yOffset = geometryOptions.frontTextSize + geometryOptions.secondRowTextSize / 2
        this.createFrontTextGeometryStrategy = new CreateFrontTextGeometryStrategy()
        this.name = "Second Row Text"
        this.createFrontTextGeometryOptions = {
            font,
            text: geometryOptions.secondRowText,
            yOffset,
            textSize: geometryOptions.secondRowTextSize
        }
    }

    async init(geometryOptions: GeometryOptions): Promise<SecondRowTextMesh> {
        this.geometry = await this.createFrontTextGeometryStrategy.create(geometryOptions, this.createFrontTextGeometryOptions)

        this.material = new MeshBasicMaterial()

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }
}
