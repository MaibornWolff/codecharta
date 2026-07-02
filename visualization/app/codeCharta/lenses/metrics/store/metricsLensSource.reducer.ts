import { combineReducers } from "@ngrx/store"
import { attributeTypes, defaultAttributeTypes } from "./attributeTypes/attributeTypes.reducer"
import { attributeDescriptors, defaultAttributeDescriptors } from "./attributeDescriptors/attributeDescriptors.reducer"

// The metrics lens's cc.json SOURCE root (Slice 9a): the node+edge attribute-type map and the flat
// attribute-descriptor map, seeded from the loaded cc.json. Slice 9a pulled these two slices out of the
// `fileSettings` combineReducers into this lens-owned `state.metricsLensSource` root. The lens transiently
// owns the edge side of `attributeTypes` too, until a dependency-lens store lands (roadmap 9a).
export const metricsLensSource = combineReducers({
    attributeTypes,
    attributeDescriptors
})

export const defaultMetricsLensSource = {
    attributeTypes: defaultAttributeTypes,
    attributeDescriptors: defaultAttributeDescriptors
}
