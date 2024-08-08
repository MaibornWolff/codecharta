import { CreateSvgGeometryStrategy } from "./../../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { FrontLogo } from "./frontLogo"
import { GeneralSizeChangeMesh } from "../generalMesh"

export class FrontMWLogoMesh extends FrontLogo implements GeneralSizeChangeMesh {
    constructor(name: string) {
        super(name, "right")
    }

    async init(geometryOptions: GeometryOptions, createSvgGeometryStrategy = new CreateSvgGeometryStrategy()): Promise<FrontMWLogoMesh> {
        const size = (geometryOptions.frontTextSize * geometryOptions.width) / 250
        this.geometry = await createSvgGeometryStrategy.create(geometryOptions, {
            filePath: "codeCharta/assets/mw_logo.svg",
            size,
            side: "front"
        })

        const xPosition = geometryOptions.width / 2 - size / 2 - geometryOptions.mapSideOffset / 2
        const yPosition = size / 2
        const zPosition = geometryOptions.printHeight / 2
        this.position.set(xPosition, yPosition, zPosition)

        if (geometryOptions.secondRowVisible) {
            this.changeRelativeSize(geometryOptions)
        }

        this.updateColor(geometryOptions.numberOfColors)

        return this
    }

    changeSize(geometryOptions: GeometryOptions, oldWidth: number): void {
        this.position.x += (geometryOptions.width - oldWidth) / 2
        return
    }
}
