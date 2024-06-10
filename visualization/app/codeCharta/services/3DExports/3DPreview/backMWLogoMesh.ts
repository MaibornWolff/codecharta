import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { BufferGeometry, MeshBasicMaterial } from "three"
import { CreateSvgGeometryStrategy } from "./CreateGeometryStrategies/createSvgGeometryStrategy"

export class BackMWLogoMesh extends ManualVisibilityMesh {
    constructor(geometry?: BufferGeometry, material?: MeshBasicMaterial, minScale?: number, manualVisibility = true, minNumberOfColors = 2) {
        super(geometry, material, minScale, manualVisibility, minNumberOfColors)
        this.name = "Back MW Logo"
    }

    async init(wantedWidth: number, mapSideOffset: number, baseplateHeight: number, numberOfColors: number): Promise<BackMWLogoMesh> {
        const createSvgStrategy = new CreateSvgGeometryStrategy()
        const mwLogoGeometry = await createSvgStrategy.create({filePath:"codeCharta/assets/mw_logo_text.svg"})
        mwLogoGeometry.center()
        mwLogoGeometry.rotateZ(Math.PI)
        const mwBackLogoScale = (3 * (wantedWidth - mapSideOffset * 2)) / 10
        mwLogoGeometry.scale(mwBackLogoScale, mwBackLogoScale, baseplateHeight / 2)
        mwLogoGeometry.translate(0, wantedWidth / 2 - mwBackLogoScale / 2 + 5, -((baseplateHeight * 3) / 4))

        const material = new MeshBasicMaterial()

        this.geometry = mwLogoGeometry
        this.material = material

        this.updateColor(this, numberOfColors)

        return this
    }
}
