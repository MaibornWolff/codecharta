import { CreateGeometryStrategy } from "../CreateGeometryStrategies/createGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { SizeChangeStrategy } from "./sizeChangeStrategy"
import { GeneralMesh } from "../MeshModels/generalMesh"

export class SizeChangeCreateStrategy implements SizeChangeStrategy {
    constructor(private createGeometryStrategy: CreateGeometryStrategy) {}

    async execute(geometryOptions: GeometryOptions, _: number, mesh: GeneralMesh): Promise<void> {
        mesh.boundingBoxCalculated = false
        this.createGeometryStrategy.create(geometryOptions).then(geometry => {
            mesh.geometry = geometry
        })
        return
    }
}
