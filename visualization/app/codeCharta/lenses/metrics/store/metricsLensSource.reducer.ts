import { combineReducers } from "@ngrx/store"
import { MetricsLensSource } from "../../../codeCharta.model"
import { attributeTypes, defaultAttributeTypes } from "./attributeTypes/attributeTypes.reducer"
import { attributeDescriptors, defaultAttributeDescriptors } from "./attributeDescriptors/attributeDescriptors.reducer"

// The metrics lens's cc.json SOURCE root (Slice 9a): the NODE attribute-type map (`attributeTypes.nodes`)
// and the flat attribute-descriptor map, seeded from the loaded cc.json. Slice 9a pulled these two slices
// out of the `fileSettings` combineReducers into this lens-owned `state.metricsLensSource` root; Slice 14
// re-homed the EDGE side of `attributeTypes` to the dependency lens's `state.dependencyLensSource`, so the
// runtime `attributeTypes.edges` here is now empty (the type keeps the full `AttributeTypes` shape).
export const metricsLensSource = combineReducers({
    attributeTypes,
    attributeDescriptors
})

export const defaultMetricsLensSource: MetricsLensSource = {
    attributeTypes: defaultAttributeTypes,
    attributeDescriptors: defaultAttributeDescriptors
}
