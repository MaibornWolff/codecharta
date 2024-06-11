import { GeometryOptions } from "../preview3DPrintMesh"
import { BufferGeometry } from "three"

export interface CreateGeometryStrategyParameters {}
export abstract class CreateGeometryStrategy {
    constructor(public createGeometryStrategyParameters: CreateGeometryStrategyParameters) {}
    abstract create(geometryOptions: GeometryOptions): Promise<BufferGeometry>
}
