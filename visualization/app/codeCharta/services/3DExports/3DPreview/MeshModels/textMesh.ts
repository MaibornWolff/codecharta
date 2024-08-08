import { CustomVisibilityMesh } from "./customVisibilityMesh"
import { GeometryOptions } from "../preview3DPrintMesh"
import { CreateTextGeometryStrategy, CreateTextGeometryStrategyOptions } from "../CreateGeometryStrategies/createTextGeometryStrategy"
import { BackPrintColorChangeStrategy } from "../ColorChangeStrategies/backPrintColorChangeStrategy"

export class TextMesh extends CustomVisibilityMesh {
    constructor(
        name: string,
        colorChangeStrategy = new BackPrintColorChangeStrategy(),
        minScale: number,
        manualVisibility: boolean,
        public createTextGeometryOptions: CreateTextGeometryStrategyOptions,
        private createTextGeometryStrategy = new CreateTextGeometryStrategy()
    ) {
        super(name, colorChangeStrategy, minScale, manualVisibility)
    }

    async init(geometryOptions: GeometryOptions): Promise<TextMesh> {
        this.geometry = await this.createTextGeometryStrategy.create(geometryOptions, this.createTextGeometryOptions)

        this.updateColor(geometryOptions.numberOfColors)

        return this
    }

    async updateText(geometryOptions: GeometryOptions) {
        this.geometry = await this.createTextGeometryStrategy.create(geometryOptions, this.createTextGeometryOptions)
        this.boundingBoxCalculated = false
    }

    updateTextGeometryOptions(text: string) {
        this.createTextGeometryOptions.text = text
    }
}
