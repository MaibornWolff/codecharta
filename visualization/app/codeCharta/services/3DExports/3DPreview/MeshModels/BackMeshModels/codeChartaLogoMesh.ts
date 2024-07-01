import { CustomVisibilityMesh } from "../customVisibilityMesh"
import { CreateSvgGeometryStrategy } from "../../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { BackPrintColorChangeStrategy } from "../../ColorChangeStrategies/backPrintColorChangeStrategy"

export class CodeChartaLogoMesh extends CustomVisibilityMesh {
    constructor(name: string) {
        super(name, new BackPrintColorChangeStrategy(), 180, true)
    }

    async init(geometryOptions: GeometryOptions): Promise<CodeChartaLogoMesh> {
        const createSvgStrategy = new CreateSvgGeometryStrategy()
        const size = 0.17
        this.geometry = await createSvgStrategy.create(geometryOptions, {
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
