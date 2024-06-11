import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { BufferGeometry, MeshBasicMaterial } from "three"
import { CreateSvgGeometryStrategy } from "../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"

export class BackMWLogoMesh extends ManualVisibilityMesh {
    constructor(
        geometry?: BufferGeometry,
        material?: MeshBasicMaterial,
        minScale?: number,
        manualVisibility = true,
        minNumberOfColors = 2
    ) {
        super(geometry, material, minScale, manualVisibility, minNumberOfColors)
        this.name = "Back MW Logo"
    }

    async init(geometryOptions: GeometryOptions): Promise<BackMWLogoMesh> {
        const createSvgStrategy = new CreateSvgGeometryStrategy({ ...geometryOptions, filePath: "codeCharta/assets/mw_logo_text.svg" })
        const mwLogoGeometry = await createSvgStrategy.create(geometryOptions)
        mwLogoGeometry.center()
        mwLogoGeometry.rotateZ(Math.PI)
        const mwBackLogoScale = (3 * (geometryOptions.width - geometryOptions.mapSideOffset * 2)) / 10
        mwLogoGeometry.scale(mwBackLogoScale, mwBackLogoScale, geometryOptions.baseplateHeight / 2)
        mwLogoGeometry.translate(0, geometryOptions.width / 2 - mwBackLogoScale / 2 + 5, -((geometryOptions.baseplateHeight * 3) / 4))

        const material = new MeshBasicMaterial()

        this.geometry = mwLogoGeometry
        this.material = material

        //this.changeColor(this, numberOfColors)

        return this
    }
}
