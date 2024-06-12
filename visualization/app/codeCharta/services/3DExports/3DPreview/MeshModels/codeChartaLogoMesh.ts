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
        const logoGeometry = await createSvgStrategy.create(geometryOptions, { filePath: "codeCharta/assets/codecharta_logo.svg" })
        logoGeometry.center()
        logoGeometry.rotateZ(Math.PI)

        const logoScale = 40
        logoGeometry.scale(logoScale, logoScale, geometryOptions.baseplateHeight / 2)
        logoGeometry.translate(0, 40, -((geometryOptions.baseplateHeight * 3) / 4))
        this.geometry = logoGeometry

        this.material = new MeshBasicMaterial()

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }
}
