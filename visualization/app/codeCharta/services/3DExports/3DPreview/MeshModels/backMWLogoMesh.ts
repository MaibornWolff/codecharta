import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { CreateSvgGeometryStrategy } from "../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { MeshBasicMaterial } from "three"

export class BackMWLogoMesh extends ManualVisibilityMesh {
    constructor(
    ) {
        super(true, 2, 0.2)
        this.name = "Back MW Logo"
    }

    async init(geometryOptions: GeometryOptions): Promise<BackMWLogoMesh> {
        const createSvgStrategy = new CreateSvgGeometryStrategy({ filePath: "codeCharta/assets/mw_logo_text.svg" })
        const mwLogoGeometry = await createSvgStrategy.create(geometryOptions)
        mwLogoGeometry.center()
        mwLogoGeometry.rotateZ(Math.PI)
        const mwBackLogoScale = (3 * (geometryOptions.width - geometryOptions.mapSideOffset * 2)) / 10
        mwLogoGeometry.scale(mwBackLogoScale, mwBackLogoScale, geometryOptions.baseplateHeight / 2)
        mwLogoGeometry.translate(0, geometryOptions.width / 2 - mwBackLogoScale / 2 + 5, -((geometryOptions.baseplateHeight * 3) / 4))

        const material = new MeshBasicMaterial()

        this.geometry = mwLogoGeometry
        this.material = material

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }
}
