import { defaultMarkedPackages, markedPackages } from "./markedPackages/markedPackages.reducer"
import { defaultEdges, edges } from "./edges/edges.reducer"
import { blacklist, defaultBlacklist } from "./blacklist/blacklist.reducer"
import {
    attributeTypes,
    defaultAttributeTypes,
    attributeDescriptors,
    defaultAttributeDescriptors
} from "../../../lenses/metrics/metricsLens.load.facade"
import { combineReducers } from "@ngrx/store"

export const fileSettings = combineReducers({
    markedPackages,
    edges,
    attributeTypes,
    attributeDescriptors,
    blacklist
})

export const defaultFileSettings = {
    markedPackages: defaultMarkedPackages,
    edges: defaultEdges,
    attributeTypes: defaultAttributeTypes,
    attributeDescriptors: defaultAttributeDescriptors,
    blacklist: defaultBlacklist
}
