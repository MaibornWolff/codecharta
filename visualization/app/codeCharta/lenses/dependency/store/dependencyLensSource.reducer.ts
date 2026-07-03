import { combineReducers } from "@ngrx/store"
import { DependencyLensSource } from "../../../codeCharta.model"
import { edgeAttributeTypes, defaultEdgeAttributeTypes } from "./attributeTypes/attributeTypes.reducer"

// The dependency lens's cc.json SOURCE root (Slice 14): the EDGE attribute-type map, seeded from the
// loaded cc.json. Slice 9a transiently parked the edge side of `attributeTypes` in the metrics lens's
// `state.metricsLensSource`; this slice re-homes it to the dependency lens's own `state.dependencyLensSource`
// root — the twin of `metricsLensSource`, one step later. Per ADR 12 the dependency lens owns the edge
// attribute types (`lenses.dependency` = edges + edge attribute types/descriptors), the metrics lens the
// node ones (`state.metricsLensSource`).
export const dependencyLensSource = combineReducers({
    attributeTypes: edgeAttributeTypes
})

export const defaultDependencyLensSource: DependencyLensSource = {
    attributeTypes: defaultEdgeAttributeTypes
}
