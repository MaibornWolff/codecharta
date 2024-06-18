import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { GeometryOptions } from "../preview3DPrintMesh"
import { MeshBasicMaterial } from "three"
import { CreateTextGeometryStrategy, CreateTextGeometryStrategyOptions } from "../CreateGeometryStrategies/createTextGeometryStrategy"
import { SizeChangeTranslateStrategy } from "../SizeChangeStrategies/sizeChangeTranslateStrategy"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"

export class TextMesh extends ManualVisibilityMesh {
    readonly createTextGeometryStrategy: CreateTextGeometryStrategy

    constructor(
        name: string,
        sizeChangeStrategy: SizeChangeTranslateStrategy,
        public createTextGeometryOptions: CreateTextGeometryStrategyOptions,
        manualVisibility: boolean,
        minNumberOfColors: number,
        minScale: number,
        colorChangeStrategy = new DefaultPrintColorChangeStrategy()
    ) {
        super(name, sizeChangeStrategy, colorChangeStrategy, minScale, manualVisibility, minNumberOfColors)
        this.createTextGeometryStrategy = new CreateTextGeometryStrategy()
    }

    async init(geometryOptions: GeometryOptions): Promise<TextMesh> {
        this.geometry = await this.createTextGeometryStrategy.create(geometryOptions, this.createTextGeometryOptions)

        this.material = new MeshBasicMaterial()

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }

    async updateText(geometryOptions: GeometryOptions) {
        this.geometry = await this.createTextGeometryStrategy.create(geometryOptions, this.createTextGeometryOptions)
        this.boundingBoxCalculated = false
    }
}
