import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { CreateSvgGeometryStrategy } from "../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { MeshBasicMaterial } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"
import { SizeChangeScaleStrategy } from "../SizeChangeStrategies/sizeChangeScaleStrategy"

export class BackMWLogoMesh extends ManualVisibilityMesh {
    constructor() {
        super(new SizeChangeScaleStrategy(), new DefaultPrintColorChangeStrategy(), true, 2, 0.2)
        this.name = "Back MW Logo"
    }

    async init(geometryOptions: GeometryOptions): Promise<BackMWLogoMesh> {
        const createSvgStrategy = new CreateSvgGeometryStrategy()
        const size = geometryOptions.width / 3.2
        const xPosition = 0
        const yPosition = geometryOptions.width / 2 - geometryOptions.mapSideOffset / 2 - size / 2 + 13
        this.geometry = await createSvgStrategy.create(geometryOptions, {
            filePath: "codeCharta/assets/mw_logo_text.svg",
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
