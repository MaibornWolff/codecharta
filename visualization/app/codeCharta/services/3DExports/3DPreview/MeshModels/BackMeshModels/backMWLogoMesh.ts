import { CustomVisibilityMesh } from "../customVisibilityMesh"
import { CreateSvgGeometryStrategy } from "../../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { BackPrintColorChangeStrategy } from "../../ColorChangeStrategies/backPrintColorChangeStrategy"

export class BackMWLogoMesh extends CustomVisibilityMesh {
    constructor(name: string) {
        super(name, new BackPrintColorChangeStrategy(), 120, true)
        this.name = "BackMWLogo"
    }

    async init(geometryOptions: GeometryOptions): Promise<BackMWLogoMesh> {
        const createSvgStrategy = new CreateSvgGeometryStrategy()
        const size = 0.31
        this.geometry = await createSvgStrategy.create(geometryOptions, {
            filePath: "codeCharta/assets/mw_logo_text.svg",
            size,
            side: "back"
        })

        const xPosition = 0
        const yPosition = 0.37
        const zPosition = -geometryOptions.baseplateHeight + geometryOptions.printHeight / 2
        this.position.set(xPosition, yPosition, zPosition)

        this.updateColor(geometryOptions.numberOfColors)

        return this
    }
}
