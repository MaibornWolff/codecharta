/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { GeneralMesh } from "./generalMesh"
import { ShaderMaterial } from "three"
import { SizeChangeCreateStrategy, SizeChangeCreateStrategyParameters } from "../SizeChangeStrategies/sizeChangeCreateStrategy"
import { CreateBaseplateGeometryStrategy } from "../CreateGeometryStrategies/createBaseplateGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"

export class BaseplateMesh extends GeneralMesh {
    constructor() {
        super(new CreateBaseplateGeometryStrategy({}), new SizeChangeCreateStrategy())
        this.name = "Baseplate"
    }

    init(geometryOptions: GeometryOptions) {
        this.createGeometryStrategy.create(geometryOptions).then(geometry => {
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
    }

    async changeSize(geometryOptions: GeometryOptions, oldWidth: number): Promise<void> {
        return this.sizeChangeStrategy.execute(geometryOptions, {
            oldWidth,
            mesh: this,
            createGeometryStrategy: this.createGeometryStrategy
        } as SizeChangeCreateStrategyParameters)
    }

    changeColor(numberOfColors: number) {
        const shaderMaterial = this.material as ShaderMaterial
        shaderMaterial.defaultAttributeValues.color = numberOfColors === 1 ? [1, 1, 1] : [0.5, 0.5, 0.5]
    }
}
