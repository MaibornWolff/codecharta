import { createSelector } from "@ngrx/store"
import { metricsLensSourceSelector } from "../metricsLensSource.selector"

export const nodeAttributeTypesSelector = createSelector(metricsLensSourceSelector, source => source.attributeTypes)
