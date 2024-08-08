import { BackPrintColorChangeStrategy } from "../../ColorChangeStrategies/backPrintColorChangeStrategy"
import { CreateSvgGeometryStrategy } from "../../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { CustomVisibilityMesh } from "../customVisibilityMesh"

export class CodeChartaLogoMesh extends CustomVisibilityMesh {
    private createSvgStrategy: CreateSvgGeometryStrategy

    constructor(name: string, createSvgStrategy: CreateSvgGeometryStrategy = new CreateSvgGeometryStrategy()) {
        super(name, new BackPrintColorChangeStrategy(), 180, true)
        this.createSvgStrategy = createSvgStrategy
    }

    async init(geometryOptions: GeometryOptions): Promise<CodeChartaLogoMesh> {
        const size = 0.17
        this.geometry = await this.createSvgStrategy.create(geometryOptions, {
            filePath: "codeCharta/assets/codecharta_logo.svg",
            size,
            side: "back"
        })

        const xPosition = 0
        const yPosition = 0.18 - size / 2
        const zPosition = -geometryOptions.baseplateHeight + geometryOptions.printHeight / 2
        this.position.set(xPosition, yPosition, zPosition)

        this.updateColor(geometryOptions.numberOfColors)

        return this
    }
}
