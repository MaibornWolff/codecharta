import { createSelector } from "@ngrx/store"
import { RadialFolderStyle } from "../../../../model/codeCharta.model"
import { folderSwatchBackground } from "../../../../util/radialFolderValues"
import { mapColorsSelector } from "../../../mapState/mapState.read.facade"
import { radialFolderStyleSelector } from "../radialFolderStyle/radialFolderStyle.selector"
import { radialFolderTintSelector } from "../radialFolderTint/radialFolderTint.selector"

export const radialFolderSwatchSelector = createSelector(
    mapColorsSelector,
    radialFolderStyleSelector,
    radialFolderTintSelector,
    (mapColors, style, tint) => folderSwatchBackground(mapColors, style, tint)
)

export const radialTintedFolderSwatchSelector = createSelector(mapColorsSelector, radialFolderTintSelector, (mapColors, tint) =>
    folderSwatchBackground(mapColors, RadialFolderStyle.Tinted, tint)
)
