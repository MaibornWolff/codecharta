import { BufferGeometry } from "three"
import { GeometryOptions } from "../preview3DPrintMesh"

export interface CreateGeometryStrategyOptions {}
export interface CreateGeometryStrategy {
    create(geometryOptions: GeometryOptions, strategyOptions?: CreateGeometryStrategyOptions): Promise<BufferGeometry>
}
