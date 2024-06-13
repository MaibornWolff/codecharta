import { CreateSvgGeometryStrategy } from "../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { MeshBasicMaterial } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"
import { SizeChangeTranslateStrategy, SizeChangeTranslateStrategyOptions } from "../SizeChangeStrategies/sizeChangeTranslateStrategy"
import { GeneralMesh } from "./generalMesh"

export class FrontMWLogoMesh extends GeneralMesh {
    constructor() {
        super(new SizeChangeTranslateStrategy(), new DefaultPrintColorChangeStrategy())
        this.name = "Front MW Logo"
    }

    async init(geometryOptions: GeometryOptions): Promise<FrontMWLogoMesh> {
        const createSvgStrategy = new CreateSvgGeometryStrategy()
        const size = (geometryOptions.frontTextSize * geometryOptions.width) / 200
        const xPosition = geometryOptions.width / 2 - size / 2 - geometryOptions.mapSideOffset / 2
        const yPosition = -geometryOptions.width / 2 - geometryOptions.mapSideOffset / 2 + size / 2
        this.geometry = await createSvgStrategy.create(geometryOptions, {
            filePath: "codeCharta/assets/mw_logo.svg",
            size,
            xPosition,
            yPosition,
            side: "front"
        })

        this.material = new MeshBasicMaterial()

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
