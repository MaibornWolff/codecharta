import { CustomVisibilityMesh } from "./customVisibilityMesh"
import { CreateSvgGeometryStrategy } from "../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { MeshBasicMaterial } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"

export class CodeChartaLogoMesh extends CustomVisibilityMesh {
    constructor(name: string) {
        super(name, new DefaultPrintColorChangeStrategy(), 180, true, 2)
    }

    async init(geometryOptions: GeometryOptions): Promise<CodeChartaLogoMesh> {
        const createSvgStrategy = new CreateSvgGeometryStrategy()
        const size = 0.17
        this.geometry = await createSvgStrategy.create(geometryOptions, {
            filePath: "codeCharta/assets/codecharta_logo.svg",
            size,
            side: "back"
        })

        this.material = new MeshBasicMaterial()

        const xPosition = 0
        const yPosition = 0.18 - size / 2
        const zPosition = -geometryOptions.baseplateHeight + geometryOptions.printHeight / 2
        this.position.set(xPosition, yPosition, zPosition)

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }
}
