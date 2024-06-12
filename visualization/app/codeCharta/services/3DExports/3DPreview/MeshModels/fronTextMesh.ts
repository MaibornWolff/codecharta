import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { GeometryOptions } from "../preview3DPrintMesh"
import { Font, MeshBasicMaterial } from "three"
import {
    CreateFrontTextGeometryStrategy,
    CreateFrontTextGeometryStrategyOptions
} from "../CreateGeometryStrategies/createFrontTextGeometryStrategy"
import { SizeChangeTranslateStrategy } from "../SizeChangeStrategies/sizeChangeTranslateStrategy"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"

export class FronTextMesh extends ManualVisibilityMesh {
    private readonly createFrontTextGeometryStrategy: CreateFrontTextGeometryStrategy
    private readonly createFrontTextGeometryOptions: CreateFrontTextGeometryStrategyOptions

    constructor(
        public font: Font,
        geometryOptions: GeometryOptions
    ) {
        super(new SizeChangeTranslateStrategy(), new DefaultPrintColorChangeStrategy(), true, 1, 0)
        this.name = "Front Text"
        this.createFrontTextGeometryStrategy = new CreateFrontTextGeometryStrategy()
        let text = geometryOptions.frontText
        if (!text) {
            text = "CodeCharta"
        }
        this.createFrontTextGeometryOptions = {
            font,
            text,
            yOffset: 0,
            textSize: geometryOptions.frontTextSize
        }
    }

    async init(geometryOptions: GeometryOptions): Promise<FronTextMesh> {
        this.geometry = await this.createFrontTextGeometryStrategy.create(geometryOptions, this.createFrontTextGeometryOptions)

        this.material = new MeshBasicMaterial()

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }
}
