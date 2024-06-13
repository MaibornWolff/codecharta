import { CreateSvgGeometryStrategy } from "../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { MeshBasicMaterial } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"
import { SizeChangeTranslateStrategy, SizeChangeTranslateStrategyOptions } from "../SizeChangeStrategies/sizeChangeTranslateStrategy"
import { GeneralMesh } from "./generalMesh"

export class CustomLogoMesh extends GeneralMesh {
    constructor(private filePath: string) {
        super(new SizeChangeTranslateStrategy(), new DefaultPrintColorChangeStrategy())
        this.name = "CustomLogo"
    }

    async init(geometryOptions: GeometryOptions): Promise<CustomLogoMesh> {
       const createSvgStrategy = new CreateSvgGeometryStrategy()
        const size = (geometryOptions.frontTextSize * geometryOptions.width) / 200
        this.geometry = await createSvgStrategy.create(geometryOptions, {
            filePath: this.filePath,
            size,
            side: "front"
        })

        this.material = new MeshBasicMaterial()

        const xPosition = -geometryOptions.width / 2 + size / 2 + geometryOptions.mapSideOffset / 2
        const yPosition = -geometryOptions.width / 2 - geometryOptions.mapSideOffset / 2 + size / 2
        const zPosition = geometryOptions.printHeight
        this.position.set(xPosition, yPosition, zPosition)

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }

    async changeSize(geometryOptions: GeometryOptions, oldWidth: number): Promise<void> {
        return this.sizeChangeStrategy.execute(geometryOptions, {
            mesh: this,
            oldWidth,
            xPosition: "left"
        } as SizeChangeTranslateStrategyOptions)
    }

    setColor(color: string) {
        (this.material as MeshBasicMaterial).color.set(color)
    }

    rotate() {
        this.geometry.rotateZ(Math.PI / 2)
    }

    flip() {
        this.geometry.rotateY(Math.PI)
    }
}
