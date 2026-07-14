import { createSelector } from "@ngrx/store"
import { dependencyLensSourceSelector } from "../dependencyLensSource.selector"

export const edgeAttributeTypesSelector = createSelector(dependencyLensSourceSelector, source => source.attributeTypes)
