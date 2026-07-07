import { createSelector } from "@ngrx/store"
import { metricsLensSourceSelector } from "../metricsLensSource.selector"

export const attributeTypesSelector = createSelector(metricsLensSourceSelector, source => source.attributeTypes)
