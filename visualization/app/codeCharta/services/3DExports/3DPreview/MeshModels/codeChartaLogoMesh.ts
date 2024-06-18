import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { CreateSvgGeometryStrategy } from "../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { MeshBasicMaterial } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"

export class CodeChartaLogoMesh extends ManualVisibilityMesh {
    constructor(name: string) {
        super(name, new DefaultPrintColorChangeStrategy(), 0.8, true, 2)
    }

    async init(geometryOptions: GeometryOptions): Promise<CodeChartaLogoMesh> {
        const createSvgStrategy = new CreateSvgGeometryStrategy()
        const size = geometryOptions.width / 6
        this.geometry = await createSvgStrategy.create(geometryOptions, {
            filePath: "codeCharta/assets/codecharta_logo.svg",
            size,
            side: "back"
        })

        this.material = new MeshBasicMaterial()

        const xPosition = 0
        const yPosition = geometryOptions.width / 5.5 - size / 2
        const zPosition = -geometryOptions.baseplateHeight + geometryOptions.printHeight / 2
        this.position.set(xPosition, yPosition, zPosition)

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }
}
