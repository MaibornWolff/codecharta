import { GeometryOptions } from "../preview3DPrintMesh"
import { SizeChangeStrategy } from "./sizeChangeStrategy"
import { GeneralMesh } from "../MeshModels/generalMesh"

export class SizeChangeFixPositionStrategy implements SizeChangeStrategy {
    constructor(private xPositionFunction: (geometryOptions: GeometryOptions) => number, private yPositionFunction: (geometryOptions: GeometryOptions) => number){}

    async execute(geometryOptions: GeometryOptions, _: number, mesh: GeneralMesh): Promise<void> {
        mesh.position.x = this.xPositionFunction(geometryOptions)
        mesh.position.y = this.yPositionFunction(geometryOptions)
    }
}
