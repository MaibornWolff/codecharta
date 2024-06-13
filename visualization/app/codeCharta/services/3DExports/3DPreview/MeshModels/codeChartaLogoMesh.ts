import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { CreateSvgGeometryStrategy } from "../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { MeshBasicMaterial } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"
import { SizeChangeScaleStrategy } from "../SizeChangeStrategies/sizeChangeScaleStrategy"

export class CodeChartaLogoMesh extends ManualVisibilityMesh {
    constructor() {
        super(new SizeChangeScaleStrategy(), new DefaultPrintColorChangeStrategy(), true, 2, 0.8)
        this.name = "CodeCharta Logo"
    }

    async init(geometryOptions: GeometryOptions): Promise<CodeChartaLogoMesh> {
        const createSvgStrategy = new CreateSvgGeometryStrategy()
        const size = geometryOptions.width / 6
        const xPosition = 0
        const yPosition = geometryOptions.width / 5.5 - size / 2
        this.geometry = await createSvgStrategy.create(geometryOptions, {
            filePath: "codeCharta/assets/codecharta_logo.svg",
            size,
            xPosition,
            yPosition,
            side: "back"
        })

        this.material = new MeshBasicMaterial()

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }
}
