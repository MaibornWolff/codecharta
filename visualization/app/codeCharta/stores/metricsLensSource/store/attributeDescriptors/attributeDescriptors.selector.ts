import { createSelector } from "@ngrx/store"
import { metricsLensSourceSelector } from "../metricsLensSource.selector"

export const attributeDescriptorsSelector = createSelector(metricsLensSourceSelector, source => source.attributeDescriptors)
