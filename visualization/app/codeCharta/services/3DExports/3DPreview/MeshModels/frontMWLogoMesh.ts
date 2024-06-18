import { CreateSvgGeometryStrategy } from "../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { MeshBasicMaterial } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"
import { FrontLogo } from "./frontLogo"
import { GeneralSizeChangeMesh } from "./generalMesh"

export class FrontMWLogoMesh extends FrontLogo implements GeneralSizeChangeMesh {
    constructor(name: string) {
        super(name, new DefaultPrintColorChangeStrategy(), "right")
    }

    async init(geometryOptions: GeometryOptions): Promise<FrontMWLogoMesh> {
        const createSvgStrategy = new CreateSvgGeometryStrategy()
        const size = (geometryOptions.frontTextSize * geometryOptions.width) / 250
        this.geometry = await createSvgStrategy.create(geometryOptions, {
            filePath: "codeCharta/assets/mw_logo.svg",
            size,
            side: "front"
        })

        this.material = new MeshBasicMaterial()

        const xPosition = geometryOptions.width / 2 - size / 2 - geometryOptions.mapSideOffset / 2
        const yPosition = -geometryOptions.width / 2 - geometryOptions.mapSideOffset / 2 + size / 2
        const zPosition = geometryOptions.printHeight
        this.position.set(xPosition, yPosition, zPosition)

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }

    async changeSize(geometryOptions: GeometryOptions, oldWidth: number) {
        this.position.x += (geometryOptions.width - oldWidth) / 2
        return
    }
}
