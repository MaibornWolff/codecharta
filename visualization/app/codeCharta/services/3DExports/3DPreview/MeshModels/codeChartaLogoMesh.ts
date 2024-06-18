import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { CreateSvgGeometryStrategy } from "../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { MeshBasicMaterial } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"
import { SizeChangeScaleStrategy } from "../SizeChangeStrategies/sizeChangeScaleStrategy"

export class CodeChartaLogoMesh extends ManualVisibilityMesh {
    constructor() {
        super(new SizeChangeScaleStrategy(), new DefaultPrintColorChangeStrategy(), 0.8, true, 2)
        this.name = "CodeChartaLogo"
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
        const zPosition = -geometryOptions.printHeight * 2
        this.position.set(xPosition, yPosition, zPosition)

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }
}
