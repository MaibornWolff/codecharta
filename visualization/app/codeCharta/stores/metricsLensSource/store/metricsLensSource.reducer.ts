import { combineReducers } from "@ngrx/store"
import { MetricsLensSource } from "../../../model/codeCharta.model"
import { attributeDescriptors, defaultAttributeDescriptors } from "./attributeDescriptors/attributeDescriptors.reducer"
import { attributeTypes, defaultAttributeTypes } from "./attributeTypes/attributeTypes.reducer"

// The metrics lens's cc.json SOURCE root: the NODE attribute-type map and the attribute-descriptor map,
// both seeded from the loaded cc.json. The EDGE attribute types live in `state.dependencyLensSource`.
export const metricsLensSource = combineReducers({
    attributeTypes,
    attributeDescriptors
})

export const defaultMetricsLensSource: MetricsLensSource = {
    attributeTypes: defaultAttributeTypes,
    attributeDescriptors: defaultAttributeDescriptors
}
