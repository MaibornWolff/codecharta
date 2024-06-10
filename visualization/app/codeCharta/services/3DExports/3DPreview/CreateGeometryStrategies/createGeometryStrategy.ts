import { BufferGeometry, ExtrudeGeometry } from "three"

export interface CreateGeometryStrategyParams {}
export interface CreateGeometryStrategy {
    create(createStrategyParams: CreateGeometryStrategyParams): Promise<BufferGeometry>;
}
