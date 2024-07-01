import { CreateSvgGeometryStrategy } from "../../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { MeshBasicMaterial } from "three"
import { FrontLogo } from "./frontLogo"
import { GeneralSizeChangeMesh } from "../generalMesh"

export class CustomLogoMesh extends FrontLogo implements GeneralSizeChangeMesh {
    constructor(
        name: string,
        private filePath: string
    ) {
        super(name, "left")
    }

    async init(geometryOptions: GeometryOptions): Promise<CustomLogoMesh> {
        const createSvgStrategy = new CreateSvgGeometryStrategy()
        const size = (geometryOptions.frontTextSize * geometryOptions.width) / 200
        this.geometry = await createSvgStrategy.create(geometryOptions, {
            filePath: this.filePath,
            size,
            side: "front"
        })

        const xPosition = -geometryOptions.width / 2 + size / 2 + geometryOptions.mapSideOffset / 2
        const yPosition = size / 2
        const zPosition = geometryOptions.printHeight / 2
        this.position.set(xPosition, yPosition, zPosition)

        if (geometryOptions.secondRowVisible) {
            this.changeRelativeSize(geometryOptions)
        }

        this.updateColor(geometryOptions.numberOfColors)

        return this
    }

    setColor(color: string) {
        const material = this.material as MeshBasicMaterial
        material.color.set(color)
    }

    rotate() {
        this.geometry.rotateZ(Math.PI / 2)
    }

    flip() {
        this.geometry.rotateY(Math.PI)
    }

    changeSize(geometryOptions: GeometryOptions, oldWidth: number): void {
        this.position.x -= (geometryOptions.width - oldWidth) / 2
        return
    }
}
