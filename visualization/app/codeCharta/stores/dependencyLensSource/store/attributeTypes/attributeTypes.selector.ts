import { createSelector } from "@ngrx/store"
import { dependencyLensSourceSelector } from "../dependencyLensSource.selector"

export const attributeTypesSelector = createSelector(dependencyLensSourceSelector, source => source.attributeTypes)
