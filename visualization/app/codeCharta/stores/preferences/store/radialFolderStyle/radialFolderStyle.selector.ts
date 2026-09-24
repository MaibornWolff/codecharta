import { createSelector } from "@ngrx/store"
import { RadialFolderStyle } from "../../../../model/codeCharta.model"
import { preferencesSelector } from "../preferences.selector"

export const radialFolderStyleSelector = createSelector(preferencesSelector, preferences => preferences.radialFolderStyle)

export const isRadialFolderNeutralSelector = createSelector(radialFolderStyleSelector, style => style === RadialFolderStyle.Neutral)
