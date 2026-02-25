import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const heightScalePowerExponentSelector = createSelector(appSettingsSelector, appSettings => appSettings.heightScalePowerExponent)
