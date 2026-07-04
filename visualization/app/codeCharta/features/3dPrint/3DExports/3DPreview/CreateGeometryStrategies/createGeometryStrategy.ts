import { BufferGeometry } from "three"
import { GeometryOptions } from "../geometryOptions"

export interface CreateGeometryStrategyOptions {}
export interface CreateGeometryStrategy {
    create(geometryOptions: GeometryOptions, strategyOptions?: CreateGeometryStrategyOptions): Promise<BufferGeometry>
}
