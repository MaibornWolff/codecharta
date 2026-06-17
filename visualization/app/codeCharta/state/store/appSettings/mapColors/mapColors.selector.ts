import { createSelector } from "@ngrx/store"
import { MapColors } from "../../../../codeCharta.model"
import { appSettingsSelector } from "../appSettings.selector"

export const mapColorsSelector = createSelector(appSettingsSelector, appSettings => withRestoredMarkingColors(appSettings.mapColors))

// markingColors is persisted to IndexedDB and some browsers restore it as an object instead of a string array
const withRestoredMarkingColors = (mapColors: MapColors): MapColors => {
    if (Array.isArray(mapColors.markingColors)) {
        return mapColors
    }
    return { ...mapColors, markingColors: Object.values(mapColors.markingColors) }
}
