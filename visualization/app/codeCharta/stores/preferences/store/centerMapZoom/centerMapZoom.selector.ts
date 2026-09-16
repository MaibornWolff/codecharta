import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

export const centerMapZoomSelector = createSelector(preferencesSelector, preferences => preferences.centerMapZoom)
