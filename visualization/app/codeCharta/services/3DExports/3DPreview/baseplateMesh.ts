import { GeneralMesh } from "./generalMesh"
import { CreateBaseplateStrategy, CreateGeometryBaseplateParams } from "./CreateGeometryStrategies/createBaseplateStrategy"
import { BufferGeometry, Material, ShaderMaterial } from "three"
import { onSizeChangeCreateStrategy } from "./SizeChangeStrategies/OnSizeChangeCreateStrategy"

export class BaseplateMesh extends GeneralMesh {
    private createBaseplateStrategy: CreateBaseplateStrategy;

    constructor() {
        super()
        this.name = "Baseplate"
    }

    init(createGeometryBaseplateParams: CreateGeometryBaseplateParams, numberOfColors: number, defaultMaterial: Material) {
        this.createBaseplateStrategy = new CreateBaseplateStrategy()
        this.createBaseplateStrategy.create({
            wantedWidth: createGeometryBaseplateParams.wantedWidth,
            secondRowVisible: createGeometryBaseplateParams.secondRowVisible,
            mapSideOffset: createGeometryBaseplateParams.mapSideOffset,
            baseplateHeight: createGeometryBaseplateParams.baseplateHeight,
            frontTextSize: createGeometryBaseplateParams.frontTextSize,
            secondRowTextSize: createGeometryBaseplateParams.secondRowTextSize
        }).then((geometry) => {
            this.geometry = geometry
        })

        //at the moment we use a workaround, so we don't need to calculate color, delta, deltaColor and isHeight
        //the downside of this workaround is that there can only be one default color for all objects
        //if its needed that all objects have ShaderMaterial have a look at geometryGenerator.ts
        const shaderMaterial = new ShaderMaterial()
        shaderMaterial.copy(defaultMaterial)
        shaderMaterial.polygonOffset = true
        shaderMaterial.polygonOffsetUnits = 1
        shaderMaterial.polygonOffsetFactor = 0.1
        this.material = shaderMaterial

        this.updateColor(this, numberOfColors)
    }

    async onSizeChangeStrategy(createGeometryBaseplateParams: CreateGeometryBaseplateParams): Promise<void> {
        const sizeChangeStrategy = new onSizeChangeCreateStrategy()
        await sizeChangeStrategy.execute({params: createGeometryBaseplateParams, createCallback: this.createBaseplateStrategy.create, object: this})
    }
}
