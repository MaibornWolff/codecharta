import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { CreateSvgGeometryStrategy } from "../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { MeshBasicMaterial } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"

export class CodeChartaLogoMesh extends ManualVisibilityMesh {
    constructor(
    ) {
        super(new DefaultPrintColorChangeStrategy(), true, 2, 0.8)
        this.name = "CodeCharta Logo"
    }

    async init(geometryOptions: GeometryOptions): Promise<CodeChartaLogoMesh> {
        const createSvgStrategy = new CreateSvgGeometryStrategy("codeCharta/assets/codecharta_logo.svg" )
        const logoGeometry = await createSvgStrategy.create(geometryOptions)
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
