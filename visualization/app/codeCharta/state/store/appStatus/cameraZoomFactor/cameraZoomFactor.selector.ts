import { createSelector } from "@ngrx/store"
import { appStatusSelector } from "../appStatus.selector"

export const cameraZoomFactorSelector = createSelector(appStatusSelector, appStatus => appStatus.cameraZoomFactor)
