import { createSelector } from "@ngrx/store"
import { AppStatus } from "../../../../codeCharta.model"
import { appStatusSelector } from "../appStatus.selector"

export const selectedBuildingIdSelector = createSelector(appStatusSelector, (appStatus: AppStatus) => appStatus.selectedBuildingId)
