import { CreateSvgGeometryStrategy } from "../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { MeshBasicMaterial } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"
import { SizeChangeTranslateStrategy, SizeChangeTranslateStrategyOptions } from "../SizeChangeStrategies/sizeChangeTranslateStrategy"
import { FrontLogo } from "./frontLogo"

export class FrontMWLogoMesh extends FrontLogo {
    constructor() {
        super(new SizeChangeTranslateStrategy(), new DefaultPrintColorChangeStrategy(), "right")
        this.name = "FrontMWLogo"
    }

    async init(geometryOptions: GeometryOptions): Promise<FrontMWLogoMesh> {
        const createSvgStrategy = new CreateSvgGeometryStrategy()
        const size = (geometryOptions.frontTextSize * geometryOptions.width) / 200
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

    async changeSize(geometryOptions: GeometryOptions, oldWidth: number): Promise<void> {
        return this.sizeChangeStrategy.execute(geometryOptions, {
            mesh: this,
            oldWidth,
            xPosition: "right"
        } as SizeChangeTranslateStrategyOptions)
    }
}
