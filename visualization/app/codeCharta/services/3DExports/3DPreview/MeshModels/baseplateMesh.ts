import { GeneralMesh, GeneralSizeChangeMesh } from "./generalMesh"
import { SizeChangeCreateStrategy, SizeChangeCreateStrategyOptions } from "../SizeChangeStrategies/sizeChangeCreateStrategy"
import { CreateBaseplateGeometryStrategy } from "../CreateGeometryStrategies/createBaseplateGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { ShaderMaterial } from "three"
import { BaseplateColorChangeStrategy } from "../ColorChangeStrategies/baseplateColorChangeStrategy"

export class BaseplateMesh extends GeneralMesh implements GeneralSizeChangeMesh {
    private readonly createBaseplateGeometryStrategy: CreateBaseplateGeometryStrategy

    constructor() {
        super("Baseplate", new SizeChangeCreateStrategy(), new BaseplateColorChangeStrategy())
        this.createBaseplateGeometryStrategy = new CreateBaseplateGeometryStrategy()
    }

    async init(geometryOptions: GeometryOptions): Promise<BaseplateMesh> {
        this.createBaseplateGeometryStrategy.create(geometryOptions).then(geometry => {
            this.geometry = geometry
        })

        //at the moment we use a workaround, so we don't need to calculate color, delta, deltaColor and isHeight
        //the downside of this workaround is that there can only be one default color for all objects
        //if its needed that all objects have ShaderMaterial have a look at geometryGenerator.ts
        const shaderMaterial = new ShaderMaterial()
        shaderMaterial.copy(geometryOptions.defaultMaterial)
        shaderMaterial.polygonOffset = true
        shaderMaterial.polygonOffsetUnits = 1
        shaderMaterial.polygonOffsetFactor = 0.1
        this.material = shaderMaterial

        this.changeColor(geometryOptions.numberOfColors)
        return new Promise(resolve => {
            resolve(this)
        })
    }

    async changeSize(geometryOptions: GeometryOptions): Promise<void> {
        return this.sizeChangeStrategy.execute(geometryOptions, {
            mesh: this,
            createGeometryStrategy: this.createBaseplateGeometryStrategy
        } as SizeChangeCreateStrategyOptions)
    }
}
