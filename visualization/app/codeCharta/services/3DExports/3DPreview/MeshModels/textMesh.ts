import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { GeometryOptions } from "../preview3DPrintMesh"
import { MeshBasicMaterial } from "three"
import {
    CreateFrontTextGeometryStrategy,
    CreateFrontTextGeometryStrategyOptions
} from "../CreateGeometryStrategies/createFrontTextGeometryStrategy"
import { SizeChangeTranslateStrategy } from "../SizeChangeStrategies/sizeChangeTranslateStrategy"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"

export abstract class TextMesh extends ManualVisibilityMesh {
    readonly createFrontTextGeometryStrategy: CreateFrontTextGeometryStrategy

    constructor(
        sizeChangeStrategy: SizeChangeTranslateStrategy,
        public createFrontTextGeometryOptions: CreateFrontTextGeometryStrategyOptions,
        manualVisibility: boolean,
        minNumberOfColors: number,
        minScale: number
    ) {
        super(sizeChangeStrategy, new DefaultPrintColorChangeStrategy(), manualVisibility, minNumberOfColors, minScale)
        this.createFrontTextGeometryStrategy = new CreateFrontTextGeometryStrategy()
    }

    async init(geometryOptions: GeometryOptions): Promise<TextMesh> {
        this.geometry = await this.createFrontTextGeometryStrategy.create(geometryOptions, this.createFrontTextGeometryOptions)

        this.material = new MeshBasicMaterial()

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }
}
